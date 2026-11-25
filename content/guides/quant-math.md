---
title: The entire math behind quant trading bots
shortTitle: Quant bot math
hook: f**king entire math behind quant trading bots
description: '70 formulas every quant trading bot runs on, in 17 sections: returns, volatility, cointegration, Kalman, Kelly, VaR, order books, market making, Black–Scholes, backtesting and costs. Each with plain English, when a bot uses it, and Python.'
lede: From log returns to Avellaneda–Stoikov. 70 formulas in the order you need them, each with what it means, when a bot actually uses it and a tested Python snippet you can copy. Plus 35 free courses, classic papers and docs.
category: Quant
tags:
- quant
- trading-bots
- math
- python
- market-making
- options
- risk
icon: ∑
accent: '#5eead4'
updated: '2026-11-26'
verified: '2026-11-26'
featured: true
unit: formulas
disclaimer: Education only, not financial advice. Formulas are the textbook versions; real markets break their assumptions (fat tails, regime changes, costs). Test everything on paper before risking money.
stats:
- value: '70'
  label: formulas
  note: rendered math, plain English
- value: '17'
  label: sections
  note: returns → execution → backtesting
- value: '70'
  label: Python snippets
  note: all run on NumPy/SciPy/pandas
sections:
- id: returns
  title: Returns
  kicker: the unit of everything
  intro: Every signal, risk number and performance stat starts from returns, not prices. Get these right first.
  formulas:
  - id: simple-return
    name: Simple return
    tex: R_t = \frac{P_t - P_{t-1}}{P_{t-1}} = \frac{P_t}{P_{t-1}} - 1
    means: The percentage change from one bar to the next.
    bot: 'P&L and portfolio returns: simple returns add across assets, so a portfolio return is the weighted sum $R_p = \sum_i w_i R_i$.'
    code: "import numpy as np\n\ndef simple_returns(prices):\n    p = np.asarray(prices, float)\n    return p[1:] / p[:-1] - 1"
  - id: log-return
    name: Log return
    tex: r_t = \ln\frac{P_t}{P_{t-1}} = \ln(1 + R_t)
    means: 'The continuously compounded return. Log returns add over time: the return over many bars is the sum of the bar returns.'
    bot: Most models (volatility, z-scores, regressions) run on log returns because they are additive in time and closer to symmetric.
    code: "import numpy as np\n\ndef log_returns(prices):\n    return np.diff(np.log(np.asarray(prices, float)))"
    example: 'Price 100 → 110 → 99: simple returns +10% and −10%, but you are down 1%. Log returns +9.53% and −10.54% sum to −1.01% = ln(0.99).'
  - id: compounding
    name: Compounding and annualized return (CAGR)
    tex: \text{CAGR} = \Big(\prod_{t=1}^{n}(1+R_t)\Big)^{N/n} - 1
    means: The constant yearly growth rate that turns your start equity into your end equity. N is bars per year (252 trading days, 365 for crypto daily, 8760 for crypto hourly).
    bot: The headline return number in every backtest report, and the numerator of the Calmar ratio.
    code: "import numpy as np\n\ndef cagr(returns, periods_per_year=252):\n    r = np.asarray(returns, float)\n    growth = np.prod(1 + r)\n    return growth ** (periods_per_year / len(r)) - 1"
  - id: volatility-drag
    name: Volatility drag
    tex: \mathbb{E}[\text{log growth}] \approx \mu - \tfrac{1}{2}\sigma^2
    means: Compound growth is lower than the average return. The bigger the swings, the bigger the gap.
    bot: 'Why leverage has a ceiling: doubling leverage doubles μ but quadruples σ²/2. It is the reason the Kelly criterion exists.'
    code: "def geometric_growth(mu, sigma):\n    # mu, sigma per period (e.g. annual)\n    return mu - 0.5 * sigma ** 2"
    example: +50% then −50% averages 0% but leaves you at 0.75× start (−25%).
- id: volatility
  title: Volatility and variance
  kicker: how much it moves
  intro: Volatility sizes positions, sets stops, scales signals and prices options. Bots estimate it constantly.
  formulas:
  - id: variance-std
    name: Sample variance and standard deviation
    tex: \begin{gathered}\hat\sigma^2 = \frac{1}{n-1}\sum_{t=1}^{n}(r_t - \bar r)^2 \\[4pt] \hat\sigma = \sqrt{\hat\sigma^2}\end{gathered}
    means: The average squared distance from the mean (n−1 corrects the bias of using the sample mean).
    bot: The default risk estimate for each asset and the denominator of the Sharpe ratio and z-scores.
    code: "import numpy as np\n\ndef volatility(returns):\n    return np.std(returns, ddof=1)"
  - id: annualized-vol
    name: Annualizing volatility (square-root-of-time)
    tex: \sigma_{\text{annual}} = \sigma_{\text{period}}\sqrt{N}
    means: If returns are independent, variance grows linearly with time, so volatility grows with the square root of time.
    bot: Converting a 1-minute or daily vol into the yearly number used in risk limits and option pricing.
    code: "import numpy as np\n\ndef annualize_vol(sigma, periods_per_year=252):\n    return sigma * np.sqrt(periods_per_year)"
    example: 1% daily vol × √252 ≈ 15.9% a year.
  - id: ewma-vol
    name: EWMA volatility (RiskMetrics)
    tex: \sigma_t^2 = \lambda\,\sigma_{t-1}^2 + (1-\lambda)\,r_{t-1}^2
    means: 'An exponentially weighted variance: recent returns count more. RiskMetrics used λ = 0.94 for daily data.'
    bot: A cheap, always-updating vol estimate for live position sizing and vol targeting.
    code: "import numpy as np\n\ndef ewma_vol(returns, lam=0.94):\n    r = np.asarray(returns, float)\n    var = np.empty_like(r)\n    var[0] = r[0] ** 2\n    for t in range(1, len(r)):\n        var[t] = lam * var[t - 1] + (1 - lam) * r[t - 1] ** 2\n    return np.sqrt(var)"
  - id: garch
    name: GARCH(1,1)
    tex: \begin{gathered}\sigma_t^2 = \omega + \alpha\,\varepsilon_{t-1}^2 + \beta\,\sigma_{t-1}^2 \\[4pt] \bar\sigma^2 = \frac{\omega}{1-\alpha-\beta}\end{gathered}
    means: 'Volatility clusters: calm follows calm, storms follow storms. GARCH adds a long-run level that vol reverts to (needs α + β < 1).'
    bot: Forecasting tomorrow's vol for sizing and risk, and spotting when the market is in a high-vol regime.
    code: "from arch import arch_model  # pip install arch\n\ndef garch_forecast(returns_pct):\n    res = arch_model(returns_pct, vol='GARCH', p=1, q=1).fit(disp='off')\n    return res.forecast(horizon=1).variance.iloc[-1, 0] ** 0.5"
- id: statistics
  title: Mean, z-score and significance
  kicker: is it real or noise?
  intro: Before a bot trades a pattern it should ask whether the pattern is bigger than the noise.
  formulas:
  - id: z-score
    name: Z-score
    tex: z_t = \frac{x_t - \mu_t}{\sigma_t}
    means: How many standard deviations a value is from its (rolling) mean.
    bot: 'The standard mean-reversion trigger: enter when |z| > 2, exit when z crosses back near 0. Also used to normalize features.'
    code: "import pandas as pd\n\ndef rolling_z(series: pd.Series, window=60):\n    mu = series.rolling(window).mean()\n    sd = series.rolling(window).std()\n    return (series - mu) / sd"
  - id: standard-error
    name: Standard error of the mean
    tex: \text{SE}(\bar r) = \frac{\sigma}{\sqrt{n}}
    means: How uncertain your estimate of the average return is. Halving it takes 4× the data.
    bot: Tells you whether the average trade is distinguishable from zero.
    code: "import numpy as np\n\ndef standard_error(x):\n    x = np.asarray(x, float)\n    return x.std(ddof=1) / np.sqrt(len(x))"
  - id: t-stat
    name: t-statistic of the mean
    tex: t = \frac{\bar r}{\hat\sigma/\sqrt{n}}
    means: 'Signal-to-noise of the average return. Rule of thumb: |t| > 2 is weak evidence, and with many tested ideas you need far more (around 3).'
    bot: A quick significance check on a strategy's per-trade or per-day P&L.
    code: "from scipy import stats\n\ndef t_test(returns):\n    return stats.ttest_1samp(returns, 0.0)  # statistic, pvalue"
  - id: sharpe-t
    name: t-stat of a Sharpe ratio
    tex: t \approx \text{SR}_{\text{annual}}\times\sqrt{\text{years}}
    means: A Sharpe ratio is a mean divided by a std, so its significance grows with the square root of the sample length.
    bot: 'Sanity check for a backtest: annual Sharpe 1 over 4 years gives t ≈ 2, borderline.'
    code: "import numpy as np\n\ndef sharpe_t(sr_annual, years):\n    return sr_annual * np.sqrt(years)"
- id: correlation
  title: Covariance and correlation
  kicker: how things move together
  intro: Diversification, hedging and pairs trading all come down to how two return series co-move.
  formulas:
  - id: covariance
    name: Covariance
    tex: \operatorname{Cov}(X,Y) = \mathbb{E}\big[(X-\mu_X)(Y-\mu_Y)\big]
    means: Positive when two series tend to be above their means at the same time.
    bot: The building block of portfolio risk and of hedge ratios.
    code: "import numpy as np\n\ndef covariance(x, y):\n    return np.cov(x, y, ddof=1)[0, 1]"
  - id: pearson-correlation
    name: Pearson correlation
    tex: \rho_{XY} = \frac{\operatorname{Cov}(X,Y)}{\sigma_X\,\sigma_Y} \in [-1, 1]
    means: Covariance rescaled to −1…1, so you can compare across assets.
    bot: Choosing pair candidates, checking that new signals are not just old ones, and watching for correlations jumping toward 1 in a crash.
    code: "import numpy as np\n\ndef correlation(x, y):\n    return np.corrcoef(x, y)[0, 1]"
  - id: portfolio-variance
    name: Portfolio variance
    tex: \begin{gathered}\sigma_p^2 = w^\top \Sigma\, w = \sum_i\sum_j w_i w_j \Sigma_{ij}\end{gathered}
    means: 'Total risk of a book given weights w and covariance matrix Σ. For two assets: $w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\sigma_1\sigma_2$.'
    bot: Risk checks before every rebalance, and the objective in mean-variance optimizers.
    code: "import numpy as np\n\ndef portfolio_vol(w, cov):\n    w = np.asarray(w, float)\n    return float(np.sqrt(w @ cov @ w))"
    example: 'Two assets, 20% vol each, ρ = 0.5, 50/50: σ = √0.03 ≈ 17.3%, less than 20%.'
  - id: shrinkage
    name: Covariance shrinkage (Ledoit–Wolf)
    tex: \hat\Sigma = \delta F + (1-\delta) S, \qquad 0 \le \delta \le 1
    means: Blend the noisy sample covariance S with a simple structured target F. Ledoit–Wolf picks δ from the data.
    bot: With many assets and little history, raw S makes optimizers bet on noise. Shrinkage gives stabler weights.
    code: "from sklearn.covariance import LedoitWolf\n\ndef shrunk_cov(returns_matrix):\n    lw = LedoitWolf().fit(returns_matrix)\n    return lw.covariance_, lw.shrinkage_"
- id: regression
  title: Regression, beta and alpha
  kicker: separate skill from market
  intro: Regression splits a return stream into the part explained by a factor (beta) and the part that is left (alpha).
  formulas:
  - id: ols
    name: OLS regression
    tex: \hat\beta = (X^\top X)^{-1} X^\top y
    means: 'The coefficients that minimize squared errors. With one regressor: $\hat\beta = \operatorname{Cov}(x,y)/\operatorname{Var}(x)$.'
    bot: Hedge ratios, factor exposures and linear signal models.
    code: "import numpy as np\n\ndef ols(X, y):\n    X = np.column_stack([np.ones(len(X)), X])  # add intercept\n    coef, *_ = np.linalg.lstsq(X, y, rcond=None)\n    return coef  # [alpha, beta1, ...]"
  - id: beta
    name: Beta
    tex: \beta_i = \frac{\operatorname{Cov}(r_i, r_m)}{\operatorname{Var}(r_m)}
    means: How much an asset moves per 1% move in the market (or any benchmark).
    bot: Market-neutral bots short β units of the index per unit of the asset to remove market risk.
    code: "import numpy as np\n\ndef beta(asset, market):\n    c = np.cov(asset, market, ddof=1)\n    return c[0, 1] / c[1, 1]"
  - id: capm-alpha
    name: CAPM and Jensen's alpha
    tex: \alpha_i = \bar r_i - \big[r_f + \beta_i(\bar r_m - r_f)\big]
    means: Return beyond what the market exposure alone would have paid.
    bot: Checks whether a strategy has real edge or is just leveraged beta.
    code: "def jensen_alpha(r_asset, r_market, beta, r_free=0.0):\n    return r_asset - (r_free + beta * (r_market - r_free))"
  - id: r-squared
    name: R²
    tex: R^2 = 1 - \frac{\sum (y_t - \hat y_t)^2}{\sum (y_t - \bar y)^2}
    means: Share of variance the model explains. In markets a tiny R² (1%) can still be a tradable edge.
    bot: Comparing signal models, and checking how much of a book is just factor exposure.
    code: "import numpy as np\n\ndef r_squared(y, y_hat):\n    y, y_hat = np.asarray(y), np.asarray(y_hat)\n    return 1 - np.sum((y - y_hat) ** 2) / np.sum((y - y.mean()) ** 2)"
- id: cointegration
  title: Stationarity, cointegration and pairs
  kicker: find spreads that come back
  intro: Prices wander; some spreads between prices don't. Statistical arbitrage trades the spreads that are stationary.
  formulas:
  - id: adf
    name: Augmented Dickey–Fuller test
    tex: '\begin{gathered}\Delta y_t = a + \gamma\,y_{t-1} + \sum_{i=1}^{p}\delta_i\,\Delta y_{t-i} + \varepsilon_t \\[4pt] H_0: \gamma = 0 \;\;(\text{unit root})\end{gathered}'
    means: If γ is significantly negative the series pulls back toward its mean (stationary). Prices usually fail; returns usually pass.
    bot: Screen candidate spreads before trading them as mean-reverting.
    code: "from statsmodels.tsa.stattools import adfuller\n\ndef is_stationary(series, alpha=0.05):\n    stat, pvalue, *_ = adfuller(series)\n    return pvalue < alpha, pvalue"
  - id: engle-granger
    name: Engle–Granger cointegration
    tex: y_t = \alpha + \beta x_t + u_t, \qquad u_t \sim I(0)
    means: Two non-stationary prices are cointegrated if some linear combination of them (the spread u) is stationary.
    bot: 'Pairs trading: long y and short β·x when the spread is low, the reverse when it is high.'
    code: "from statsmodels.tsa.stattools import coint\nimport numpy as np\n\ndef pair_test(y, x):\n    t, pvalue, _ = coint(y, x)\n    beta = np.polyfit(x, y, 1)[0]\n    return pvalue, beta"
  - id: spread-z
    name: Spread z-score trading rule
    tex: \begin{gathered}s_t = y_t - \beta x_t, \qquad z_t = \frac{s_t-\mu_s}{\sigma_s} \\[4pt] \text{position}_t = \begin{cases}-1 & z_t > z_{\text{in}}\\ +1 & z_t < -z_{\text{in}}\\ 0 & |z_t| < z_{\text{out}}\\ \text{position}_{t-1} & \text{otherwise}\end{cases}\end{gathered}
    means: Sell the spread when it is stretched high, buy it when stretched low, flatten when it returns to normal (otherwise keep yesterday's position).
    bot: 'The core loop of a stat-arb bot. Typical values: z_in = 2, z_out = 0.5.'
    code: "import numpy as np\n\ndef pair_positions(z, z_in=2.0, z_out=0.5):\n    pos, out = 0, []\n    for v in z:\n        if v > z_in: pos = -1\n        elif v < -z_in: pos = 1\n        elif abs(v) < z_out: pos = 0\n        out.append(pos)\n    return np.array(out)"
  - id: half-life-ar1
    name: Half-life of mean reversion
    tex: \begin{gathered}\Delta s_t = c + \lambda\, s_{t-1} + \varepsilon_t \\[4pt] t_{1/2} = -\frac{\ln 2}{\ln(1+\lambda)} \approx -\frac{\ln 2}{\lambda}\end{gathered}
    means: How many bars it takes for a deviation to shrink by half. λ must be negative.
    bot: Sets lookback windows and max holding time. A 3-day half-life suits a daily bot; a 3-month one ties up capital.
    code: "import numpy as np\n\ndef half_life(spread):\n    s = np.asarray(spread, float)\n    lam = np.polyfit(s[:-1], np.diff(s), 1)[0]\n    return -np.log(2) / np.log(1 + lam)"
    example: λ = −0.05 → half-life ≈ 13.5 bars.
- id: ornstein-uhlenbeck
  title: 'Mean reversion: Ornstein–Uhlenbeck'
  kicker: the model of a rubber band
  intro: The OU process is the continuous-time model of a spread that keeps getting pulled back to a mean.
  formulas:
  - id: ou-sde
    name: Ornstein–Uhlenbeck process
    tex: dX_t = \theta(\mu - X_t)\,dt + \sigma\,dW_t
    means: X drifts toward μ at speed θ while being shaken by noise of size σ.
    bot: The standard model for a pairs spread, a basis, or a funding-rate deviation.
    code: "import numpy as np\n\ndef simulate_ou(x0, theta, mu, sigma, dt, n, seed=0):\n    rng = np.random.default_rng(seed)\n    x = np.empty(n); x[0] = x0\n    a = np.exp(-theta * dt)\n    sd = sigma * np.sqrt((1 - a ** 2) / (2 * theta))\n    for t in range(1, n):\n        x[t] = mu + (x[t - 1] - mu) * a + sd * rng.standard_normal()\n    return x"
  - id: ou-discrete
    name: Exact discretization and fitting
    tex: \begin{gathered}X_{t+\Delta} = \mu + (X_t-\mu)\,e^{-\theta\Delta} + \varepsilon \\[4pt] \operatorname{Var}(\varepsilon) = \frac{\sigma^2}{2\theta}\big(1-e^{-2\theta\Delta}\big)\end{gathered}
    means: 'Sampled at fixed steps, OU is an AR(1): regress $X_{t+1} = a + bX_t$, then $\theta = -\ln b/\Delta$ and $\mu = a/(1-b)$.'
    bot: Fit θ, μ, σ from data with one linear regression.
    code: "import numpy as np\n\ndef fit_ou(x, dt=1.0):\n    x = np.asarray(x, float)\n    b, a = np.polyfit(x[:-1], x[1:], 1)\n    theta = -np.log(b) / dt\n    mu = a / (1 - b)\n    resid = x[1:] - (a + b * x[:-1])\n    sigma = resid.std(ddof=2) * np.sqrt(2 * theta / (1 - b ** 2))\n    return theta, mu, sigma"
  - id: ou-half-life
    name: OU half-life and equilibrium width
    tex: \begin{gathered}t_{1/2} = \frac{\ln 2}{\theta}, \qquad \sigma_{\infty} = \frac{\sigma}{\sqrt{2\theta}}\end{gathered}
    means: How fast it comes back, and how wide it swings around μ in the long run.
    bot: Entry bands are usually set in units of σ∞ (e.g. enter at μ ± 2σ∞).
    code: "import numpy as np\n\ndef ou_stats(theta, sigma):\n    return np.log(2) / theta, sigma / np.sqrt(2 * theta)"
- id: momentum
  title: Momentum and trend
  kicker: what went up keeps going (for a while)
  intro: Trend-following bots bet that recent winners keep winning over weeks to months. The math is simple; the risk control is the hard part.
  formulas:
  - id: moving-averages
    name: Moving averages (SMA and EMA)
    tex: \begin{gathered}\text{SMA}_t = \frac{1}{n}\sum_{i=0}^{n-1}P_{t-i} \\[4pt] \text{EMA}_t = \alpha P_t + (1-\alpha)\,\text{EMA}_{t-1} \\[4pt] \alpha = \frac{2}{n+1}\end{gathered}
    means: Smoothed price. The EMA reacts faster because it weights recent prices more.
    bot: 'Crossover signal: long when the fast average is above the slow one, $\text{signal} = \operatorname{sign}(\text{MA}_{\text{fast}} - \text{MA}_{\text{slow}})$.'
    code: "import numpy as np\nimport pandas as pd\n\ndef ma_cross(close: pd.Series, fast=20, slow=100):\n    f = close.ewm(span=fast, adjust=False).mean()\n    s = close.ewm(span=slow, adjust=False).mean()\n    return np.sign(f - s)"
  - id: tsmom
    name: Time-series momentum with vol scaling
    tex: w_t = \operatorname{sign}\!\Big(\sum_{i=1}^{L} r_{t-i}\Big)\cdot\frac{\sigma_{\text{target}}}{\hat\sigma_t}
    means: Go long if the asset's own past return over L bars is positive, short if negative, and size so every position carries the same risk.
    bot: The classic managed-futures rule (Moskowitz, Ooi and Pedersen, 2012 use a 12-month lookback).
    code: "import numpy as np\nimport pandas as pd\n\ndef tsmom(returns: pd.Series, lookback=252, target_vol=0.10, ann=252):\n    sig = np.sign(returns.rolling(lookback).sum())\n    vol = returns.ewm(span=60).std() * np.sqrt(ann)\n    return (sig * target_vol / vol).shift(1)  # trade next bar"
  - id: xsmom
    name: Cross-sectional momentum
    tex: \begin{gathered}w_{i,t} \propto \operatorname{rank}\big(R_{i,\,t-L:t-1}\big) - \tfrac{N+1}{2} \\[4pt] \textstyle\sum_i w_{i,t} = 0\end{gathered}
    means: Rank assets by past return; buy the winners, short the losers, dollar-neutral.
    bot: Equity and crypto rotation bots. Skipping the most recent bar avoids short-term reversal.
    code: "import pandas as pd\n\ndef xs_momentum(past_returns: pd.Series):\n    centred = past_returns.rank() - (len(past_returns) + 1) / 2\n    return centred / centred.abs().sum()  # gross exposure 1"
- id: kalman
  title: Kalman filter
  kicker: estimates that update every tick
  intro: The Kalman filter tracks a hidden quantity (a hedge ratio, a fair value) that drifts over time, updating its estimate as each new observation arrives.
  formulas:
  - id: kalman-predict
    name: Predict step
    tex: \begin{gathered}\hat x_{t|t-1} = F\,\hat x_{t-1} \\[4pt] P_{t|t-1} = F P_{t-1} F^\top + Q\end{gathered}
    means: Roll the estimate forward and grow its uncertainty by the process noise Q.
    bot: Each bar, before seeing the new price.
    code: "def kf_predict(x, P, F=1.0, Q=1e-5):\n    return F * x, F * P * F + Q"
  - id: kalman-update
    name: Update step
    tex: \begin{gathered}K_t = P_{t|t-1}H^\top\big(H P_{t|t-1} H^\top + R\big)^{-1} \\[4pt] \hat x_t = \hat x_{t|t-1} + K_t\big(y_t - H\hat x_{t|t-1}\big) \\[4pt] P_t = (I - K_t H)\,P_{t|t-1}\end{gathered}
    means: Blend prediction and new observation, weighted by how much you trust each (the Kalman gain K).
    bot: 'Dynamic hedge ratio for pairs: state x = β, observation y_t = price of A, H = price of B. The residual $y_t - H\hat x$ is the live spread.'
    code: "def kf_hedge_ratio(ya, yb, Q=1e-5, R=1e-3):\n    beta, P, out = 0.0, 1.0, []\n    for a, b in zip(ya, yb):\n        P += Q                      # predict (random-walk beta)\n        K = P * b / (b * P * b + R)  # gain\n        beta += K * (a - b * beta)   # update\n        P *= (1 - K * b)\n        out.append(beta)\n    return out"
- id: performance
  title: Performance metrics
  kicker: was it worth the risk?
  intro: Return alone means nothing. These ratios put return next to the risk taken to earn it.
  formulas:
  - id: sharpe
    name: Sharpe ratio
    tex: \text{SR} = \frac{\mathbb{E}[r - r_f]}{\sigma(r - r_f)}\sqrt{N}
    means: Excess return per unit of volatility, annualized with N bars per year.
    bot: The default score for comparing strategies and allocating capital.
    code: "import numpy as np\n\ndef sharpe(returns, rf_per_period=0.0, periods_per_year=252):\n    ex = np.asarray(returns, float) - rf_per_period\n    return ex.mean() / ex.std(ddof=1) * np.sqrt(periods_per_year)"
    example: '0.1% mean daily return, 1% daily vol: SR = 0.1 × √252 ≈ 1.59.'
  - id: sortino
    name: Sortino ratio
    tex: \text{Sortino} = \frac{\mathbb{E}[r] - \tau}{\sqrt{\mathbb{E}\big[\min(0,\, r-\tau)^2\big]}}\sqrt{N}
    means: Like Sharpe, but only downside moves (below target τ) count as risk.
    bot: Fairer for strategies with big upside spikes, such as option buying or trend following.
    code: "import numpy as np\n\ndef sortino(returns, target=0.0, periods_per_year=252):\n    r = np.asarray(returns, float)\n    dd = np.sqrt(np.mean(np.minimum(0, r - target) ** 2))\n    return (r.mean() - target) / dd * np.sqrt(periods_per_year)"
  - id: max-drawdown
    name: Maximum drawdown
    tex: \text{MDD} = \max_{t}\Big(1 - \frac{W_t}{\max_{s\le t} W_s}\Big)
    means: The worst peak-to-trough loss of the equity curve W.
    bot: 'Kill switches and risk limits: stop trading if live drawdown exceeds, say, 1.5× the backtest MDD.'
    code: "import numpy as np\n\ndef max_drawdown(returns):\n    w = np.cumprod(1 + np.asarray(returns, float))\n    peak = np.maximum.accumulate(w)\n    return float(np.max(1 - w / peak))"
  - id: calmar
    name: Calmar ratio
    tex: \text{Calmar} = \frac{\text{CAGR}}{\text{MDD}}
    means: Yearly growth per unit of worst drawdown (classically measured over 36 months).
    bot: Ranks strategies by how painful they are to hold.
    code: "def calmar(cagr_value, mdd_value):\n    return cagr_value / mdd_value"
  - id: information-ratio
    name: Information ratio
    tex: \text{IR} = \frac{\mathbb{E}[r - b]}{\sigma(r - b)}\sqrt{N}
    means: Sharpe of the excess return over a benchmark b (σ(r − b) is the tracking error).
    bot: Scoring a bot that is meant to beat an index or a buy-and-hold baseline.
    code: "import numpy as np\n\ndef information_ratio(r, bench, periods_per_year=252):\n    a = np.asarray(r, float) - np.asarray(bench, float)\n    return a.mean() / a.std(ddof=1) * np.sqrt(periods_per_year)"
- id: kelly
  title: Kelly criterion and position sizing
  kicker: how much to bet
  intro: Edge decides direction; sizing decides whether you survive. Kelly maximizes long-run growth, and nearly everyone bets a fraction of it.
  formulas:
  - id: kelly-binary
    name: Kelly for a binary bet
    tex: f^* = p - \frac{1-p}{b} = \frac{bp - q}{b}
    means: Bet this fraction of capital when you win b per 1 staked with probability p (q = 1 − p).
    bot: 'Sizing bets with fixed payoffs: prediction markets, binary options, take-profit/stop-loss setups with a known hit rate.'
    code: "def kelly_binary(p, b):\n    return p - (1 - p) / b"
    example: 'p = 0.55 at even odds (b = 1): f* = 10% of capital.'
  - id: kelly-continuous
    name: Kelly for continuous returns
    tex: \begin{gathered}f^* = \frac{\mu - r_f}{\sigma^2} \\[4pt] w^* = \Sigma^{-1}(\mu - r_f)\end{gathered}
    means: Optimal leverage is excess return over variance; for many assets, the inverse covariance times the excess returns.
    bot: Upper bound on leverage. Full Kelly is very volatile and μ is uncertain, so bots use half Kelly or less.
    code: "import numpy as np\n\ndef kelly_weights(mu, cov, rf=0.0, fraction=0.5):\n    return fraction * np.linalg.solve(cov, np.asarray(mu) - rf)"
  - id: vol-targeting
    name: Volatility targeting
    tex: \text{size}_t = \frac{\sigma_{\text{target}}}{\hat\sigma_t}\times\text{capital}
    means: Scale exposure so the position's expected volatility stays constant.
    bot: Keeps risk steady as markets calm down or blow up; used by most systematic funds.
    code: "def vol_target_size(capital, target_vol, est_vol):\n    return capital * target_vol / est_vol"
  - id: fixed-fractional
    name: Fixed-fractional risk per trade
    tex: \text{qty} = \frac{\text{risk\%}\times\text{equity}}{|P_{\text{entry}} - P_{\text{stop}}|}
    means: Size so that hitting your stop loses a fixed share of equity (e.g. 1%).
    bot: The default for discretionary-style bots with explicit stops.
    code: "def position_size(equity, risk_pct, entry, stop):\n    return risk_pct * equity / abs(entry - stop)"
    example: $10,000 equity, 1% risk, entry 100, stop 95 → 20 units.
- id: risk
  title: 'Risk: VaR and expected shortfall'
  kicker: how much can I lose?
  intro: 'Risk limits answer one question: on a bad day, how bad? VaR gives the threshold; expected shortfall gives the average beyond it.'
  formulas:
  - id: parametric-var
    name: Parametric (normal) VaR
    tex: \begin{gathered}\text{VaR}_\alpha = V\,\big(z_\alpha\,\sigma - \mu\big) \\[4pt] z_{0.95} = 1.645, \qquad z_{0.99} = 2.326\end{gathered}
    means: The loss you expect to exceed only (1 − α) of the time, assuming normal returns.
    bot: Fast pre-trade risk limits.
    code: "from scipy.stats import norm\n\ndef var_normal(value, mu, sigma, alpha=0.95):\n    return value * (norm.ppf(alpha) * sigma - mu)"
    example: '$1M, 2% daily vol, μ ≈ 0: 95% one-day VaR ≈ $32.9k.'
  - id: historical-var
    name: Historical VaR
    tex: \text{VaR}_\alpha = -\,Q_{1-\alpha}(r)\times V
    means: Take the empirical (1 − α) quantile of past returns. No normality assumption.
    bot: Captures fat tails that the normal model misses.
    code: "import numpy as np\n\ndef var_historical(returns, value=1.0, alpha=0.95):\n    return -np.quantile(returns, 1 - alpha) * value"
  - id: expected-shortfall
    name: Expected shortfall (CVaR)
    tex: \begin{gathered}\text{ES}_\alpha = -\,\mathbb{E}\big[r \mid r \le -\text{VaR}_\alpha\big] \\[4pt] \text{ES}^{\text{normal}}_\alpha = \sigma\,\frac{\varphi(z_\alpha)}{1-\alpha} - \mu\end{gathered}
    means: The average loss on the days that are worse than VaR. For a normal at 95%, ES ≈ 2.06σ versus VaR = 1.645σ.
    bot: Better tail measure for strategies that sell insurance (short options, market making).
    code: "import numpy as np\n\ndef expected_shortfall(returns, alpha=0.95):\n    r = np.asarray(returns, float)\n    q = np.quantile(r, 1 - alpha)\n    return -r[r <= q].mean()"
  - id: var-scaling
    name: Scaling VaR over a horizon
    tex: \text{VaR}_{h} \approx \text{VaR}_{1}\sqrt{h}
    means: Under independent returns (and μ ≈ 0), h-day VaR grows with √h.
    bot: Converting a 1-day limit into a 10-day one. Breaks down when returns are autocorrelated.
    code: "import numpy as np\n\ndef scale_var(var_1d, days):\n    return var_1d * np.sqrt(days)"
- id: microstructure
  title: Order book microstructure and execution
  kicker: where the edge leaks out
  intro: At short horizons the order book is the signal and execution cost is the enemy. These formulas run inside every HFT and execution bot.
  formulas:
  - id: mid-spread
    name: Mid price and spread
    tex: \begin{gathered}m = \frac{P_{\text{bid}} + P_{\text{ask}}}{2} \\[4pt] \text{spread}_{\text{bps}} = \frac{P_{\text{ask}} - P_{\text{bid}}}{m}\times 10^4\end{gathered}
    means: The reference price, and the cost of crossing the book. A market round trip pays the full spread.
    bot: Every quote, fill and P&L mark is measured against the mid.
    code: "def mid_spread_bps(bid, ask):\n    mid = (bid + ask) / 2\n    return mid, (ask - bid) / mid * 1e4"
  - id: imbalance
    name: Order-book imbalance
    tex: I = \frac{Q_{\text{bid}}}{Q_{\text{bid}} + Q_{\text{ask}}} \in [0,1]
    means: 'Share of resting size on the bid. Near 1: buyers stacked, the next move is more likely up.'
    bot: One of the strongest very-short-horizon signals in liquid markets.
    code: "def imbalance(q_bid, q_ask):\n    return q_bid / (q_bid + q_ask)"
  - id: weighted-mid
    name: Weighted mid (imbalance-adjusted price)
    tex: P_{\text{w}} = I\,P_{\text{ask}} + (1 - I)\,P_{\text{bid}}
    means: Mid price tilted toward the side that is likely to be hit next. Stoikov's micro-price refines this into a proper martingale estimate.
    bot: Fair-value input for market makers and for deciding whether to cross.
    code: "def weighted_mid(bid, ask, q_bid, q_ask):\n    i = q_bid / (q_bid + q_ask)\n    return i * ask + (1 - i) * bid"
    example: 'Bid 99.98 × 10, ask 100.02 × 30: I = 0.25, P_w = 99.99 (the mid is 100.00).'
  - id: ofi
    name: Order-flow imbalance (OFI)
    tex: \begin{gathered}e_n = \mathbf{1}_{\{P^b_n \ge P^b_{n-1}\}}\,q^b_n - \mathbf{1}_{\{P^b_n \le P^b_{n-1}\}}\,q^b_{n-1} \\[4pt] \quad -\, \mathbf{1}_{\{P^a_n \le P^a_{n-1}\}}\,q^a_n + \mathbf{1}_{\{P^a_n \ge P^a_{n-1}\}}\,q^a_{n-1} \\[4pt] \text{OFI} = \textstyle\sum_n e_n\end{gathered}
    means: 'Net pressure from changes at the best bid and ask. Summed over an interval, OFI moves the mid roughly linearly: $\Delta m \approx \beta\,\text{OFI}$ (Cont, Kukanov and Stoikov, 2014).'
    bot: Short-term price prediction from L1 book updates.
    code: "import numpy as np\n\ndef ofi(bid_px, bid_sz, ask_px, ask_sz):\n    bp, bq, ap, aq = map(np.asarray, (bid_px, bid_sz, ask_px, ask_sz))\n    e = ((bp[1:] >= bp[:-1]) * bq[1:] - (bp[1:] <= bp[:-1]) * bq[:-1]\n         - (ap[1:] <= ap[:-1]) * aq[1:] + (ap[1:] >= ap[:-1]) * aq[:-1])\n    return e.sum()"
  - id: vwap-twap
    name: VWAP and TWAP
    tex: '\begin{gathered}\text{VWAP} = \frac{\sum_i p_i\,q_i}{\sum_i q_i} \\[4pt] \text{TWAP: } q_k = \frac{Q}{K} \text{ every } \frac{T}{K}\end{gathered}'
    means: VWAP is the volume-weighted average traded price; TWAP slices an order into equal pieces over time.
    bot: Execution benchmarks and the two most common ways to work a large order.
    code: "import numpy as np\n\ndef vwap(prices, volumes):\n    p, v = np.asarray(prices, float), np.asarray(volumes, float)\n    return (p * v).sum() / v.sum()\n\ndef twap_slices(total_qty, n_slices):\n    return [total_qty / n_slices] * n_slices"
  - id: slippage
    name: Slippage and implementation shortfall
    tex: \begin{gathered}\text{slippage}_{\text{bps}} = s\cdot\frac{\bar P_{\text{fill}} - P_{\text{decision}}}{P_{\text{decision}}}\times 10^4 \\[4pt] s = +1 \text{ (buy)}, \quad s = -1 \text{ (sell)}\end{gathered}
    means: How much worse you traded than the price when you decided to trade. Positive = cost.
    bot: Measured on every fill; the live-versus-backtest gap usually hides here.
    code: "def slippage_bps(fill_px, decision_px, side):\n    s = 1 if side == 'buy' else -1\n    return s * (fill_px - decision_px) / decision_px * 1e4"
  - id: square-root-impact
    name: Square-root market impact
    tex: \frac{\Delta P}{P} \approx Y\,\sigma_{\text{daily}}\sqrt{\frac{Q}{V_{\text{daily}}}}
    means: Impact grows with the square root of order size relative to daily volume, with Y of order 1. Trading 4× more costs about 2× more per share.
    bot: Capacity estimates and deciding how many slices or days a big order needs.
    code: "import numpy as np\n\ndef sqrt_impact(qty, daily_volume, daily_vol, Y=1.0):\n    return Y * daily_vol * np.sqrt(qty / daily_volume)"
    example: 'σ = 2%, order = 1% of daily volume, Y = 1: about 0.2% impact.'
- id: market-making
  title: 'Market making: Avellaneda–Stoikov'
  kicker: quote both sides, manage inventory
  intro: A market maker earns the spread but carries inventory risk. Avellaneda and Stoikov (2008) derived where to quote so inventory does not blow up.
  formulas:
  - id: reservation-price
    name: Reservation price
    tex: r(s, q, t) = s - q\,\gamma\,\sigma^2\,(T - t)
    means: 'Your personal fair price: the mid s shifted against your inventory q. Long inventory → you value the asset less → quote lower to sell it off.'
    bot: Centers the quotes. γ is risk aversion, σ is volatility, T − t is time left in the session.
    code: "def reservation_price(mid, inventory, gamma, sigma, time_left):\n    return mid - inventory * gamma * sigma ** 2 * time_left"
  - id: optimal-spread
    name: Optimal spread
    tex: \delta^a + \delta^b = \gamma\sigma^2(T - t) + \frac{2}{\gamma}\ln\!\Big(1 + \frac{\gamma}{k}\Big)
    means: 'Total quoted spread: an inventory-risk term plus a term from how fast fill probability decays with distance (order arrival intensity $\lambda(\delta) = Ae^{-k\delta}$).'
    bot: Quote bid at r − spread/2 and ask at r + spread/2, then requote on every book update.
    code: "import numpy as np\n\ndef as_quotes(mid, inventory, gamma, sigma, k, time_left):\n    r = mid - inventory * gamma * sigma ** 2 * time_left\n    spread = gamma * sigma ** 2 * time_left + (2 / gamma) * np.log(1 + gamma / k)\n    return r - spread / 2, r + spread / 2  # bid, ask"
- id: options
  title: 'Options: Black–Scholes and the Greeks'
  kicker: pricing the future
  intro: Options bots price, hedge and trade volatility. Everything rests on one model of how prices move.
  formulas:
  - id: gbm
    name: Geometric Brownian motion
    tex: \begin{gathered}dS_t = \mu S_t\,dt + \sigma S_t\,dW_t \\[4pt] S_t = S_0\exp\!\Big(\big(\mu - \tfrac{1}{2}\sigma^2\big)t + \sigma W_t\Big)\end{gathered}
    means: 'The standard model of a price: log price is a random walk with drift. Prices stay positive.'
    bot: Monte Carlo simulation of paths for pricing and stress tests.
    code: "import numpy as np\n\ndef gbm_paths(s0, mu, sigma, T, steps, n_paths, seed=0):\n    rng = np.random.default_rng(seed)\n    dt = T / steps\n    z = rng.standard_normal((n_paths, steps))\n    log_inc = (mu - 0.5 * sigma ** 2) * dt + sigma * np.sqrt(dt) * z\n    return s0 * np.exp(np.cumsum(log_inc, axis=1))"
  - id: black-scholes
    name: Black–Scholes price
    tex: \begin{gathered}C = S\,N(d_1) - K e^{-rT} N(d_2) \\[4pt] P = K e^{-rT} N(-d_2) - S\,N(-d_1) \\[4pt] d_1 = \frac{\ln(S/K) + (r + \frac{1}{2}\sigma^2)T}{\sigma\sqrt{T}} \\[4pt] d_2 = d_1 - \sigma\sqrt{T}\end{gathered}
    means: Fair value of a European call (C) and put (P) under GBM with constant volatility.
    bot: Pricing, implied-vol inversion and Greeks for every option a bot touches.
    code: "import numpy as np\nfrom scipy.stats import norm\n\ndef bs_price(S, K, T, r, sigma, call=True):\n    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))\n    d2 = d1 - sigma * np.sqrt(T)\n    if call:\n        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)\n    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)"
    example: 'S = K = 100, r = 5%, σ = 20%, T = 1: call ≈ 10.45, put ≈ 5.57.'
  - id: put-call-parity
    name: Put–call parity
    tex: C - P = S - K e^{-rT}
    means: A call minus a put with the same strike and expiry equals a forward. No model needed.
    bot: Arbitrage checks and synthetic positions; a violation (after costs) is free money or a data error.
    code: "import numpy as np\n\ndef parity_gap(C, P, S, K, r, T):\n    return (C - P) - (S - K * np.exp(-r * T))"
  - id: greeks
    name: The Greeks (call)
    tex: \begin{gathered}\Delta = N(d_1), \qquad \Gamma = \frac{\varphi(d_1)}{S\sigma\sqrt{T}} \\[4pt] \mathcal{V} = S\,\varphi(d_1)\sqrt{T} \\[4pt] \Theta = -\frac{S\,\varphi(d_1)\,\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2)\end{gathered}
    means: 'Sensitivities: price per $1 move (Δ), Δ change per $1 (Γ), per 1.00 of vol (vega), per year of time (Θ). φ is the normal density.'
    bot: Delta hedging (hold −Δ shares per option), gamma and vega limits.
    code: "import numpy as np\nfrom scipy.stats import norm\n\ndef call_greeks(S, K, T, r, sigma):\n    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))\n    d2 = d1 - sigma * np.sqrt(T)\n    delta = norm.cdf(d1)\n    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))\n    vega = S * norm.pdf(d1) * np.sqrt(T)\n    theta = -S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * norm.cdf(d2)\n    return delta, gamma, vega, theta"
  - id: implied-vol
    name: Implied volatility (Newton's method)
    tex: \sigma_{n+1} = \sigma_n - \frac{C_{\text{BS}}(\sigma_n) - C_{\text{market}}}{\mathcal{V}(\sigma_n)}
    means: The volatility that makes the model price equal the market price, found by iterating.
    bot: Comparing implied vs realized vol is the core of volatility trading.
    code: "import numpy as np\nfrom scipy.stats import norm\n\ndef implied_vol(price, S, K, T, r, sigma=0.2, tol=1e-8):\n    for _ in range(100):\n        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))\n        d2 = d1 - sigma * np.sqrt(T)\n        model = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)\n        vega = S * norm.pdf(d1) * np.sqrt(T)\n        step = (model - price) / vega\n        sigma -= step\n        if abs(step) < tol:\n            break\n    return sigma"
  - id: gamma-pnl
    name: Delta-hedged P&L (gamma vs theta)
    tex: d\Pi \approx \tfrac{1}{2}\Gamma S^2\big(\sigma_{\text{realized}}^2 - \sigma_{\text{implied}}^2\big)\,dt
    means: A delta-hedged long option makes money when the market moves more than implied vol priced in, and bleeds theta otherwise.
    bot: The P&L engine of gamma scalping and vol-arb bots.
    code: "def gamma_pnl(gamma, S, realized_vol, implied_vol, dt):\n    return 0.5 * gamma * S ** 2 * (realized_vol ** 2 - implied_vol ** 2) * dt"
- id: backtesting
  title: Backtesting without fooling yourself
  kicker: most edges die here
  intro: A backtest is a hypothesis test you can run thousands of times, which is exactly the problem. These formulas measure how much of a result is luck.
  formulas:
  - id: look-ahead
    name: 'No look-ahead: trade on the next bar'
    tex: \begin{gathered}\text{pnl}_t = w_{t-1}\cdot r_t \\[4pt] w_{t-1} = f(\text{data}_{\le t-1})\end{gathered}
    means: A position can only use information available before the return it earns.
    bot: 'In pandas: compute the signal, then `.shift(1)` before multiplying by returns.'
    code: "import pandas as pd\n\ndef backtest(signal: pd.Series, returns: pd.Series):\n    return signal.shift(1) * returns  # yesterday's signal earns today's return"
  - id: multiple-testing
    name: Multiple testing
    tex: \begin{gathered}P(\text{any false positive}) = 1 - (1-\alpha)^N\end{gathered}
    means: Test enough ideas and some will pass by luck.
    bot: Track how many variants you tried; 20 tests at 5% give a 64% chance of a fake winner.
    code: "def family_false_positive(alpha, n_tests):\n    return 1 - (1 - alpha) ** n_tests"
  - id: sharpe-se
    name: Standard error of the Sharpe ratio
    tex: \text{SE}(\widehat{\text{SR}}) \approx \sqrt{\frac{1 + \tfrac{1}{2}\widehat{\text{SR}}^2}{T}}
    means: For i.i.d. normal returns (Lo, 2002), with SR and T in the same units (e.g. per-period SR, T periods).
    bot: Error bars on a backtest Sharpe.
    code: "import numpy as np\n\ndef sharpe_se(sr_per_period, n_periods):\n    return np.sqrt((1 + 0.5 * sr_per_period ** 2) / n_periods)"
  - id: psr
    name: Probabilistic Sharpe ratio
    tex: \text{PSR}(\text{SR}^*) = \Phi\!\left(\frac{(\widehat{\text{SR}} - \text{SR}^*)\sqrt{T-1}}{\sqrt{1 - \gamma_3\widehat{\text{SR}} + \frac{\gamma_4 - 1}{4}\widehat{\text{SR}}^2}}\right)
    means: Probability that the true Sharpe beats a benchmark SR*, adjusting for track length T, skew γ₃ and kurtosis γ₄ (non-excess; per-period SR).
    bot: 'Minimum bar before allocating capital: e.g. require PSR(0) > 0.95.'
    code: "import numpy as np\nfrom scipy.stats import norm, skew, kurtosis\n\ndef psr(returns, sr_star=0.0):\n    r = np.asarray(returns, float)\n    sr = r.mean() / r.std(ddof=1)\n    g3, g4 = skew(r), kurtosis(r, fisher=False)\n    z = (sr - sr_star) * np.sqrt(len(r) - 1) / np.sqrt(1 - g3 * sr + (g4 - 1) / 4 * sr ** 2)\n    return norm.cdf(z)"
  - id: deflated-sharpe
    name: Deflated Sharpe ratio
    tex: \begin{gathered}\text{SR}^*_0 = \sqrt{V[\widehat{\text{SR}}_n]}\;\times \\[4pt] \Big((1-\gamma)\,\Phi^{-1}\!\big(1 - \tfrac{1}{N}\big) + \gamma\,\Phi^{-1}\!\big(1 - \tfrac{1}{Ne}\big)\Big) \\[4pt] \text{DSR} = \text{PSR}\big(\text{SR}^*_0\big)\end{gathered}
    means: The Sharpe the luckiest of N worthless strategies would show (γ ≈ 0.5772, the Euler–Mascheroni constant). DSR is the PSR against that bar (Bailey and López de Prado, 2014).
    bot: Report DSR, not raw Sharpe, after any parameter sweep.
    code: "import numpy as np\nfrom scipy.stats import norm\n\ndef expected_max_sharpe(n_trials, var_sr):\n    g = 0.5772156649\n    return np.sqrt(var_sr) * ((1 - g) * norm.ppf(1 - 1 / n_trials)\n                              + g * norm.ppf(1 - 1 / (n_trials * np.e)))\n# DSR = psr(returns, sr_star=expected_max_sharpe(N, var_of_trial_sharpes))"
  - id: walk-forward
    name: Walk-forward validation
    tex: \begin{gathered}\text{train } [t_0,\, t_k) \;\to\; \text{test } [t_k + g,\; t_{k+1}) \\[4pt] k \leftarrow k + 1 \;\;(\text{roll forward})\end{gathered}
    means: Fit only on the past, test on the next unseen block, roll forward. The gap g (purge/embargo) stops overlapping labels leaking.
    bot: The honest out-of-sample estimate. Shuffled k-fold leaks future information in time series.
    code: "from sklearn.model_selection import TimeSeriesSplit\n\ndef walk_forward(n_samples, n_splits=5, gap=10):\n    return list(TimeSeriesSplit(n_splits=n_splits, gap=gap).split(range(n_samples)))"
- id: costs
  title: Fees, slippage and latency
  kicker: the tax on every trade
  intro: Many backtests that look great on paper lose money live because of costs. Put them in from day one.
  formulas:
  - id: round-trip-cost
    name: Round-trip cost
    tex: c_{\text{rt}} = 2\,(f + \tfrac{1}{2}s + \iota)
    means: Per round trip you pay the fee f twice, half the spread s twice (entering and exiting at market) and impact ι twice. Everything in bps.
    bot: The hurdle every trade's expected edge must clear.
    code: "def round_trip_bps(fee_bps, spread_bps, impact_bps=0.0):\n    return 2 * (fee_bps + spread_bps / 2 + impact_bps)"
    example: '5 bps taker fee, 2 bps spread, no impact: 12 bps per round trip.'
  - id: cost-drag
    name: Annual cost drag from turnover
    tex: r_{\text{net}} \approx r_{\text{gross}} - \text{turnover}_{\text{annual}}\times c
    means: Turnover × cost per unit traded comes straight off returns. c here is the one-way cost per unit of notional traded.
    bot: 'High-frequency signals need tiny costs: 50× annual turnover at 6 bps one-way is 3% a year.'
    code: "def net_return(gross, annual_turnover, cost_one_way):\n    return gross - annual_turnover * cost_one_way"
  - id: breakeven
    name: Break-even hit rate
    tex: p_{\text{BE}} = \frac{L + c}{W + L}
    means: With average win W, average loss L (both positive) and cost c per trade, you need to win more than this share of trades.
    bot: Quick check whether a scalping rule can survive fees.
    code: "def breakeven_hit_rate(avg_win, avg_loss, cost):\n    return (avg_loss + cost) / (avg_win + avg_loss)"
    example: 'Win 10 bps, lose 10 bps, 4 bps cost: need 70% winners.'
  - id: latency-cost
    name: Latency cost
    tex: \mathbb{E}\,|\Delta P| \approx \sigma_{1\text{s}}\sqrt{\tfrac{2}{\pi}\,\Delta t}
    means: For a random walk with per-second volatility σ, the expected absolute move during a delay of Δt seconds grows with √Δt (√(2/π) ≈ 0.8 is the mean of |N(0,1)|).
    bot: Sizing the value of a faster connection, or how stale a quote gets before it reaches the exchange.
    code: "import numpy as np\n\ndef expected_move(sigma_per_sec, delay_sec):\n    return sigma_per_sec * np.sqrt(2 / np.pi * delay_sec)"
resources:
- name: 'MIT 18.S096: Mathematics with Applications in Finance'
  url: https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/
  category: Courses & books
  badge: free course · MIT OCW
  description: 'Full MIT course with video lectures: linear algebra, probability, stochastic calculus, time series, portfolio theory and Black–Scholes, taught partly by practitioners.'
  tags:
  - foundations
  - options
- name: '3Blue1Brown: Essence of linear algebra'
  url: https://www.3blue1brown.com/topics/linear-algebra
  category: Courses & books
  badge: video series
  description: Visual intuition for vectors, matrices, eigenvalues and change of basis, everything under covariance matrices and PCA.
  tags:
  - foundations
- name: 'Khan Academy: Statistics and probability'
  url: https://www.khanacademy.org/math/statistics-probability
  category: Courses & books
  badge: free course
  description: Distributions, regression, significance tests and confidence intervals from zero.
  tags:
  - foundations
  - statistics
- name: StatQuest
  url: https://www.youtube.com/@statquest
  category: Courses & books
  badge: YouTube
  description: 'Short, clear videos on statistics and machine learning: p-values, regression, cross-validation.'
  tags:
  - statistics
- name: 'Forecasting: Principles and Practice (3rd ed.)'
  url: https://otexts.com/fpp3/
  category: Courses & books
  badge: free book
  description: 'Hyndman and Athanasopoulos''s free online textbook on time series: stationarity, ARIMA, exponential smoothing, evaluation.'
  tags:
  - time series
- name: An Introduction to Statistical Learning
  url: https://www.statlearning.com/
  category: Courses & books
  badge: free book
  description: 'The free ISL book (R and Python editions): regression, classification, resampling and model selection.'
  tags:
  - statistics
  - backtesting
- name: QuantEcon lectures
  url: https://python.quantecon.org/
  category: Courses & books
  badge: free lectures
  description: Open-source Python lectures on probability, Markov chains, Kalman filtering, optimization and dynamic programming.
  tags:
  - foundations
  - kalman
- name: Kalman and Bayesian Filters in Python
  url: https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python
  category: Courses & books
  badge: free book · GitHub
  description: Roger Labbe's interactive Jupyter book on Kalman filters, built up from intuition.
  tags:
  - kalman
- name: 'Kelly (1956): A New Interpretation of Information Rate'
  url: https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf
  category: Papers
  badge: classic paper · PDF
  description: The original Kelly criterion paper from Bell Labs.
  tags:
  - sizing
- name: 'Thorp: The Kelly criterion and the stock market'
  url: https://www.edwardothorp.com/wp-content/uploads/2016/11/TheKellyCriterionAndTheStockMarket.pdf
  category: Papers
  badge: paper · PDF
  description: Ed Thorp applies Kelly to investing, from his own site.
  tags:
  - sizing
- name: 'Engle: GARCH 101'
  url: https://www.stern.nyu.edu/rengle/GARCH101.PDF
  category: Papers
  badge: paper · PDF
  description: Nobel laureate Robert Engle's plain-language introduction to ARCH/GARCH volatility models.
  tags:
  - volatility
- name: RiskMetrics Technical Document (1996)
  url: https://www.msci.com/documents/10199/5915b101-4206-4ba0-aee2-3449d5c7e95a
  category: Papers
  badge: technical doc · PDF
  description: J.P. Morgan/Reuters document that made VaR and EWMA volatility (λ = 0.94) an industry standard.
  tags:
  - risk
  - volatility
- name: 'Rockafellar & Uryasev: Optimization of Conditional Value-at-Risk'
  url: https://sites.math.washington.edu/~rtr/papers/rtr179-CVaR1.pdf
  category: Papers
  badge: paper · PDF
  description: The paper that made CVaR (expected shortfall) easy to optimize with linear programming.
  tags:
  - risk
- name: 'Gatev, Goetzmann & Rouwenhorst: Pairs Trading'
  url: https://www.nber.org/papers/w7032
  category: Papers
  badge: NBER working paper
  description: The classic study of a simple distance-based pairs-trading rule and its returns.
  tags:
  - pairs
- name: 'Moskowitz, Ooi & Pedersen: Time Series Momentum'
  url: https://w4.stern.nyu.edu/facdir/lpederse/papers/TimeSeriesMomentum.pdf
  category: Papers
  badge: paper · PDF
  description: Trend following across 58 futures markets, with the volatility-scaled rule used above.
  tags:
  - momentum
- name: 'Avellaneda & Stoikov: High-frequency trading in a limit order book'
  url: https://people.orie.cornell.edu/sfs33/LimitOrderBook.pdf
  category: Papers
  badge: paper · PDF
  description: The market-making model behind the reservation price and optimal spread formulas.
  tags:
  - market making
- name: 'Guéant, Lehalle & Fernandez-Tapia: Dealing with the inventory risk'
  url: https://arxiv.org/abs/1105.3115
  category: Papers
  badge: arXiv
  description: Closed-form solutions for the Avellaneda–Stoikov problem with inventory limits.
  tags:
  - market making
- name: 'Cont, Kukanov & Stoikov: The Price Impact of Order Book Events'
  url: https://arxiv.org/abs/1011.6402
  category: Papers
  badge: arXiv
  description: Defines order-flow imbalance and shows price changes are roughly linear in it.
  tags:
  - microstructure
- name: 'Bouchaud: Price Impact'
  url: https://arxiv.org/abs/0903.2428
  category: Papers
  badge: arXiv
  description: 'Short review of market impact: why it is concave in volume and what that means for execution.'
  tags:
  - microstructure
  - execution
- name: 'Tóth et al.: Anomalous price impact and the critical nature of liquidity'
  url: https://arxiv.org/abs/1105.1694
  category: Papers
  badge: arXiv
  description: Empirical evidence and a theory for the square-root impact law.
  tags:
  - execution
- name: 'Bailey & López de Prado: The Sharpe Ratio Efficient Frontier'
  url: https://www.davidhbailey.com/dhbpapers/sharpe-frontier.pdf
  category: Papers
  badge: paper · PDF
  description: Introduces the probabilistic Sharpe ratio (PSR) and minimum track record length.
  tags:
  - backtesting
- name: 'Bailey & López de Prado: The Deflated Sharpe Ratio'
  url: https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf
  category: Papers
  badge: paper · PDF
  description: Corrects a Sharpe ratio for the number of strategies tried and for non-normal returns.
  tags:
  - backtesting
- name: 'Bailey, Borwein, López de Prado & Zhu: The Probability of Backtest Overfitting'
  url: https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf
  category: Papers
  badge: paper · PDF
  description: A method to estimate how likely a backtest's best configuration is overfit.
  tags:
  - backtesting
- name: Kenneth French Data Library
  url: https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
  category: Data & docs
  badge: free data
  description: Free daily and monthly factor returns (market, size, value, momentum) to test betas and alphas against.
  tags:
  - data
  - regression
- name: 'statsmodels: adfuller'
  url: https://www.statsmodels.org/stable/generated/statsmodels.tsa.stattools.adfuller.html
  category: Data & docs
  badge: docs
  description: Augmented Dickey–Fuller test reference.
  tags:
  - pairs
  - time series
- name: 'statsmodels: coint'
  url: https://www.statsmodels.org/stable/generated/statsmodels.tsa.stattools.coint.html
  category: Data & docs
  badge: docs
  description: Engle–Granger cointegration test reference.
  tags:
  - pairs
- name: arch (Python)
  url: https://arch.readthedocs.io/
  category: Data & docs
  badge: docs
  description: GARCH-family volatility models, bootstraps and unit-root tests for Python.
  tags:
  - volatility
- name: SciPy stats
  url: https://docs.scipy.org/doc/scipy/reference/stats.html
  category: Data & docs
  badge: docs
  description: Distributions, normal CDF/PPF, skew, kurtosis and hypothesis tests.
  tags:
  - statistics
- name: NumPy linear algebra
  url: https://numpy.org/doc/stable/reference/routines.linalg.html
  category: Data & docs
  badge: docs
  description: Solvers, inverses and eigen-decompositions for covariance and portfolio math.
  tags:
  - foundations
- name: 'scikit-learn: LedoitWolf'
  url: https://scikit-learn.org/stable/modules/generated/sklearn.covariance.LedoitWolf.html
  category: Data & docs
  badge: docs
  description: Ledoit–Wolf shrinkage covariance estimator.
  tags:
  - risk
- name: 'scikit-learn: TimeSeriesSplit'
  url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
  category: Data & docs
  badge: docs
  description: Walk-forward splits with an optional gap for time-series validation.
  tags:
  - backtesting
- name: 'pandas: windowing operations'
  url: https://pandas.pydata.org/docs/user_guide/window.html
  category: Data & docs
  badge: docs
  description: Rolling and exponentially weighted windows for z-scores, moving averages and EWMA vol.
  tags:
  - foundations
- name: py_vollib
  url: https://github.com/vollib/py_vollib
  category: Data & docs
  badge: GitHub
  description: Fast Black–Scholes prices, Greeks and implied volatility in Python.
  tags:
  - options
- name: QuantLib
  url: https://www.quantlib.org/
  category: Data & docs
  badge: open-source library
  description: The standard open-source library for pricing derivatives and fixed income.
  tags:
  - options
- name: Quantitative Finance Stack Exchange
  url: https://quant.stackexchange.com/
  category: Data & docs
  badge: Q&A
  description: Free Q&A where practitioners answer quant math and modelling questions.
  tags:
  - community
---

## How to use this page

Read it top to bottom once. The order is deliberate: returns feed volatility, volatility feeds sizing and risk, and the last two sections (backtesting and costs) decide whether any of it makes money live.

Every snippet is plain NumPy, SciPy, pandas, statsmodels, scikit-learn or arch, and every one was run before publishing. They are deliberately small: building blocks for your own bot, not a trading system.

The 50-formula one-sheet by [hft.md](https://hft.md/qt/) (adapted from the MIT Sloan "Quant Bible") inspired this page. Here the math is written out as text, so you can search it, link to each formula and copy the code.

## FAQ

### What math do you need for algorithmic trading?
Statistics (means, variance, regression, hypothesis tests), linear algebra (covariance matrices), basic time series (stationarity, autocorrelation) and probability. Stochastic calculus only matters for options pricing, and order-book math only for high-frequency strategies.

### Which formula matters most for a trading bot?
Position sizing and costs. A small edge with good sizing (volatility targeting, fractional Kelly) and realistic costs survives; a big backtest edge with no cost model usually does not.

### Is a Sharpe ratio of 1 good?
For a live strategy after costs, an annual Sharpe around 1 is respectable and above 2 is rare. In a backtest it means little on its own: check the probabilistic and deflated Sharpe ratio, especially after trying many variants.

### Why use log returns instead of simple returns?
Log returns add up over time, so multi-period returns and statistics are simpler. Simple returns add up across assets, so use them for portfolio P&L.

### Is this financial advice?
No. It is educational material. The formulas are standard textbook versions and real markets break their assumptions.

---
layout: course
title: Robotics engineering, the interactive free course
shortTitle: Robotics engineering
hook: f**king goldmine of Robotics engineering
description: 'A free interactive robotics engineering course: 16 chapters from rotation matrices to humanoids, 16 live simulations (IK, PID, LQR, Kalman, SLAM, A*, RRT, RL, walking), 48 quiz questions, runnable Python and ROS 2 code, plus 39 free courses from MIT, Stanford, ETH and more.'
lede: Learn robotics by playing with it. 16 chapters in order, from rotation matrices to humanoids. Each has the math in plain English, a worked example, a live simulation you can drag around, tested Python or ROS 2 code and a quick quiz. Then 39 free courses from MIT, Stanford, ETH Zurich, Penn and Berkeley to go deeper. $0, no signup; your progress saves in this browser.
category: Learning
tags:
- robotics
- ros2
- control
- kinematics
- slam
- robot-learning
- interactive
- free
- course
icon: ⚙
accent: '#7dd3fc'
updated: '2026-11-26'
verified: '2026-11-26'
featured: true
unit: chapters
stats:
- value: '16'
  label: chapters
  note: frames → humanoids, in order
- value: '16'
  label: live simulations
  note: drag, tune, break, retry
- value: '48'
  label: quiz questions
  note: instant feedback
- value: '39'
  label: free courses
  note: 92 free links, $0
chapters:
- id: frames-rotations
  title: Coordinate frames and rotations
  short: Frames & rotations
  phase: 1 · Geometry
  minutes: 20
  summary: Every robot is a stack of coordinate frames. Rotation matrices tell you how one frame is turned relative to another, and most robotics bugs are frame bugs.
  body: |
    A robot is a pile of **coordinate frames**: one for the world, one for the robot's base, one for every link, one for every camera and lidar. A frame is just an origin plus three perpendicular unit axes $x, y, z$. Before a robot can grab a cup, it has to answer "where is the cup *in my gripper's frame*?", and that question is pure geometry.

    To describe how frame $B$ is turned relative to frame $A$ we use a **rotation matrix** ${}^{A}R_{B}$, a $3\times3$ matrix whose **columns are $B$'s axes written in $A$'s coordinates**. Multiply a vector expressed in $B$ by it and you get the same arrow expressed in $A$: ${}^{A}p = {}^{A}R_{B}\,{}^{B}p$.

    Rotation matrices are special. Their columns are unit length and mutually perpendicular, so $R^\top R = I$, the inverse is simply the transpose, and $\det R = +1$ (a determinant of $-1$ would be a mirror, not a rotation). Chaining frames is matrix multiplication where the inner labels cancel: ${}^{A}R_{C} = {}^{A}R_{B}\,{}^{B}R_{C}$.

    ### Roll, pitch, yaw

    Humans like three angles. ROS uses **roll** $\phi$ about $x$, **pitch** $\theta$ about $y$ and **yaw** $\psi$ about $z$, composed as $R = R_z(\psi)\,R_y(\theta)\,R_x(\phi)$. Matrix multiplication does not commute, so the *order* is part of the definition: the same three numbers in another order give a different orientation. Try both orders in the explorer below.

    At pitch $=\pm90^\circ$ roll and yaw spin about the same physical axis and you lose a degree of freedom: **gimbal lock**. That is why software (ROS messages, Isaac, MuJoCo) stores orientation as a **unit quaternion** $q = (w, x, y, z)$ and only converts to angles for humans.

    Conventions to memorise (ROS REP 103): $x$ forward, $y$ left, $z$ up, angles counter-clockwise positive, right-handed frames.
  equations:
  - id: rotation-z
    name: Rotation about z by ψ
    tex: R_z(\psi)=\begin{bmatrix}\cos\psi&-\sin\psi&0\\ \sin\psi&\cos\psi&0\\ 0&0&1\end{bmatrix}
    means: Turns vectors counter-clockwise by $\psi$ around the $z$ axis. $R_x$ and $R_y$ have the same pattern on the other axes.
  - id: roll-pitch-yaw
    name: Roll-pitch-yaw (Z-Y-X)
    tex: R(\phi,\theta,\psi)=R_z(\psi)\,R_y(\theta)\,R_x(\phi)
    means: 'The ROS convention: roll about $x$, then pitch about $y$, then yaw about $z$, read right to left.'
  - id: rotation-properties
    name: What makes R a rotation
    tex: R^\top R=I,\qquad \det R=1,\qquad R^{-1}=R^\top
    means: 'Orthonormal columns and no mirroring. Inverting a rotation is free: just transpose it.'
  - id: unit-quaternion
    name: Unit quaternion
    tex: q=\Big(\cos\tfrac{\alpha}{2},\; \hat u\,\sin\tfrac{\alpha}{2}\Big),\qquad \lVert q\rVert=1
    means: A rotation by angle $\alpha$ about unit axis $\hat u$, with no gimbal lock. This is what `geometry_msgs/Quaternion` stores.
  interactive:
    name: FrameExplorer
    title: Rotation matrix explorer
    caption: 'Drag the roll, pitch and yaw sliders and watch the coloured columns of $R$ follow the body axes. Hit **Gimbal lock**, then move roll and yaw: they now do the same thing.'
  example:
    title: Where is the camera looking?
    body: |
      A robot is yawed $90^\circ$ (facing world $+y$) and its camera is pitched $30^\circ$ nose-down. The camera looks along its own $x$ axis, $(1,0,0)$. In the world:

      $$R = R_z(90^\circ)\,R_y(30^\circ),\qquad R\begin{bmatrix}1\\0\\0\end{bmatrix}=\begin{bmatrix}0\\ \cos 30^\circ\\ -\sin 30^\circ\end{bmatrix}=\begin{bmatrix}0\\0.866\\-0.5\end{bmatrix}$$

      So the camera looks along world $+y$ and down at $30^\circ$, exactly as intended. Positive pitch points the nose *down* in a $z$-up world; getting that sign wrong is a classic first-week bug.
  code:
    code: |-
      import numpy as np

      def Rx(a): c, s = np.cos(a), np.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
      def Ry(a): c, s = np.cos(a), np.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
      def Rz(a): c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

      def rpy(roll, pitch, yaw):
          """ROS convention (REP 103): R = Rz(yaw) @ Ry(pitch) @ Rx(roll)."""
          return Rz(yaw) @ Ry(pitch) @ Rx(roll)

      R = rpy(0, np.radians(30), np.radians(90))   # yawed 90°, nose pitched down 30°
      print(np.round(R @ [1, 0, 0], 3))            # body x-axis in world: [ 0.     0.866 -0.5  ]
      print(np.allclose(R.T @ R, np.eye(3)), round(np.linalg.det(R), 6))  # True 1.0

      # Order matters: rotations do not commute
      print(np.allclose(Rz(1) @ Rx(1), Rx(1) @ Rz(1)))  # False
  quiz:
  - q: The columns of the rotation matrix ${}^{A}R_{B}$ are…
    options:
    - the axes of frame $A$ written in frame $B$'s coordinates
    - the axes of frame $B$ written in frame $A$'s coordinates
    - the roll, pitch and yaw angles
    - the position of frame B's origin
    answer: 1
    why: 'Multiply ${}^{A}R_{B}$ by $(1,0,0)$ and you get its first column: $B$''s $x$ axis, expressed in $A$.'
  - q: What is the inverse of a rotation matrix?
    options:
    - Itself
    - You need Gaussian elimination
    - Its negative
    - Its transpose
    answer: 3
    why: Orthonormal columns mean $R^\top R = I$, so $R^{-1}=R^\top$. Cheap and exact.
  - q: With Z-Y-X roll-pitch-yaw, what happens at pitch $=90^\circ$?
    options:
    - $\det R$ becomes 0
    - 'Gimbal lock: roll and yaw rotate about the same axis'
    - Nothing special
    - The matrix stops being orthonormal
    answer: 1
    why: 'R is still a perfectly valid rotation, but the three angles can no longer describe every nearby orientation: one degree of freedom is lost. Quaternions avoid this.'
  deeper:
  - Modern Robotics (Northwestern, Coursera)
  - Modern Robotics book and videos
  - '3Blue1Brown: Essence of linear algebra'
  - QUT Robot Academy
  build: Write `rpy_to_matrix` and `matrix_to_rpy`, then test round trips on 10,000 random orientations. Watch what happens near pitch $=\pm 90^\circ$.
- id: homogeneous-transforms
  title: Homogeneous transforms
  short: Homogeneous transforms
  phase: 1 · Geometry
  minutes: 20
  summary: Position and orientation together form a pose. A 4×4 matrix packs both so chaining frames, like world ← robot ← lidar, is a single multiplication.
  body: |
    Rotation alone is not enough: the lidar is not at the robot's centre, and the robot is not at the world origin. A **pose** is a rotation *and* a translation. To move a point from frame $B$ to frame $A$:

    $${}^{A}p = {}^{A}R_{B}\,{}^{B}p + {}^{A}t_{B}$$

    Rotate first, then add the offset. Chaining two of these by hand gets messy fast, so we use a trick: append a 1 to every point, $\tilde p = (x, y, z, 1)$, and pack $R$ and $t$ into one $4\times4$ **homogeneous transform** $T$. Now "rotate then translate" is one matrix product, and a whole chain of frames is just a product of matrices:

    $${}^{W}T_{S} = {}^{W}T_{B}\;{}^{B}T_{S}$$

    Read it like fractions: the inner labels ($B$) must match and cancel. ${}^{W}T_{B}$ is "the pose of the robot base in the world"; it maps base coordinates into world coordinates.

    The inverse is not just "negate everything": undoing a rotation then translation means un-translating in the *rotated* frame, so the translation part becomes $-R^\top t$.

    ### In real robots

    ROS 2 keeps a tree of these transforms in **tf2**: `map → odom → base_link → laser_link`, `base_link → camera_link`, and so on. Every time you ask "where is this lidar hit on the map?", tf2 multiplies exactly these matrices, using the right timestamp for each. In the plane (mobile robots) the same idea uses $3\times3$ matrices in $SE(2)$, which is what the interactive shows.
  equations:
  - id: homogeneous-matrix
    name: Homogeneous transform
    tex: T=\begin{bmatrix}R & t\\ 0^\top & 1\end{bmatrix}\in SE(3)
    means: Rotation $R$ (3×3) and translation $t$ (3×1) in one 4×4 matrix. In 2-D it is 3×3 with a 2×2 rotation.
  - id: apply-transform
    name: Moving a point between frames
    tex: \begin{bmatrix}{}^{A}p\\1\end{bmatrix}={}^{A}T_{B}\begin{bmatrix}{}^{B}p\\1\end{bmatrix}
    means: 'Append a 1 to the point and multiply: rotation and translation happen together.'
  - id: compose-transforms
    name: Chaining frames
    tex: '{}^{A}T_{C}={}^{A}T_{B}\;{}^{B}T_{C}'
    means: Inner labels cancel. A whole kinematic chain or tf tree is one long product.
  - id: inverse-transform
    name: Inverse transform
    tex: T^{-1}=\begin{bmatrix}R^\top & -R^\top t\\ 0^\top & 1\end{bmatrix}
    means: Undo the rotation with $R^\top$ and the translation in the rotated frame, $-R^\top t$. Cheaper and more accurate than a general matrix inverse.
  interactive:
    name: TransformChain
    title: World ← robot ← lidar
    caption: Move and turn the robot, change where the lidar is mounted, and drag the lidar hit. The three matrices update live and $T_{WS}$ is always exactly $T_{WB}\,T_{BS}$.
  example:
    title: A lidar hit on the map
    body: |
      The robot is at $(2, 1)$ facing $+y$ ($\theta = 90^\circ$). Its lidar is mounted $0.2$ m ahead of the base, and it sees an obstacle $1.5$ m straight ahead: ${}^{S}p = (1.5, 0)$.

      1. Lidar → base: ${}^{B}p = {}^{B}T_{S}\,{}^{S}p = (1.5 + 0.2,\; 0) = (1.7, 0)$.
      2. Base → world: rotate by $90^\circ$, giving $(0, 1.7)$, then add $(2, 1)$, giving ${}^{W}p = (2, 2.7)$.

      So the obstacle goes on the map at $(2.0, 2.7)$. Get the mount offset or the order wrong and your map gets a ghost wall 20 cm off.
  code:
    code: |-
      import numpy as np

      def se2(theta, x, y):
          """Planar homogeneous transform: rotate by theta, then translate by (x, y)."""
          c, s = np.cos(theta), np.sin(theta)
          return np.array([[c, -s, x], [s, c, y], [0, 0, 1.0]])

      def inv(T):
          R, t = T[:2, :2], T[:2, 2]
          Ti = np.eye(3)
          Ti[:2, :2], Ti[:2, 2] = R.T, -R.T @ t
          return Ti

      T_WB = se2(np.pi / 2, 2.0, 1.0)  # robot at (2, 1), facing +y
      T_BS = se2(0.0, 0.2, 0.0)        # lidar mounted 20 cm ahead of the base
      p_S = np.array([1.5, 0.0, 1.0])  # obstacle 1.5 m straight ahead of the lidar

      p_W = T_WB @ T_BS @ p_S
      print(np.round(p_W[:2], 3))                      # [2.  2.7]
      print(np.allclose(inv(T_WB) @ T_WB, np.eye(3)))  # True
  quiz:
  - q: Why do robotics libraries use 4×4 matrices for 3-D poses?
    options:
    - So rotation and translation are one multiplication and chains of frames compose by multiplying
    - To store the timestamp in the 4th row
    - To make rotations commute
    - Because GPUs require 4×4 matrices
    answer: 0
    why: Homogeneous coordinates turn $Rp + t$ into a single linear map, so ${}^{A}T_{C} = {}^{A}T_{B}\,{}^{B}T_{C}$.
  - q: When is the product ${}^{A}T_{B}\;{}^{C}T_{D}$ meaningful?
    options:
    - Only if $A = D$
    - Always
    - Only if $B = C$
    - Never
    answer: 2
    why: 'The inner frames must match so they cancel. Otherwise you are multiplying coordinates from two different frames: a frame bug.'
  - q: What is the translation part of $T^{-1}$?
    options:
    - $-R^\top t$
    - $t$
    - $R t$
    - $-t$
    answer: 0
    why: 'To undo $p \mapsto Rp + t$ you solve for $p$: $p = R^\top(p'' - t) = R^\top p'' - R^\top t$.'
  deeper:
  - Modern Robotics book and videos
  - Stanford CS223A Introduction to Robotics
  - ROS 2 official tutorials
  - QUT Robot Academy
  build: Publish a static transform for a camera on your robot with `ros2 run tf2_ros static_transform_publisher` and check it with `ros2 run tf2_ros tf2_echo base_link camera_link`.
- id: forward-kinematics
  title: Forward kinematics
  short: Forward kinematics
  phase: 1 · Geometry
  minutes: 20
  summary: Given the joint angles, where is the hand? Forward kinematics multiplies one transform per joint and link, and it always has exactly one answer.
  body: |
    A robot arm is a chain: base, joint, link, joint, link, …, tool. Each **joint** adds one degree of freedom (a rotation for revolute joints, a slide for prismatic ones). **Forward kinematics (FK)** answers: given all joint values $\theta_1, \dots, \theta_n$, what is the pose of the end-effector?

    The recipe is the one from the previous chapter. Each joint contributes a transform that depends on its angle, each link a fixed offset, and you multiply them in order from the base outward:

    $${}^{0}T_{n}(\theta) = {}^{0}T_{1}(\theta_1)\,{}^{1}T_{2}(\theta_2)\cdots{}^{n-1}T_{n}(\theta_n)$$

    For a planar arm with two links of length $l_1$ and $l_2$, the product simplifies to two lines of trigonometry. Note that the second link's direction is $\theta_1 + \theta_2$: joint angles are *relative* to the previous link.

    The set of all reachable points is the **workspace**. For the 2-link arm it is a ring: you can't reach further than $l_1 + l_2$ (fully stretched) or closer than $|l_1 - l_2|$ (fully folded).

    ### Describing real arms

    For a 6- or 7-joint arm nobody multiplies matrices by hand. Two standard bookkeeping systems exist: **Denavit–Hartenberg (DH) parameters**, four numbers per joint, and the **product of exponentials** used in *Modern Robotics*, one screw axis per joint. In ROS the robot's geometry lives in a **URDF** file, and libraries such as KDL, Pinocchio and MoveIt compute FK from it thousands of times per second.

    FK is the easy direction: one input, one answer, no failure cases. The next chapter does the hard one.
  equations:
  - id: fk-chain
    name: FK as a chain of transforms
    tex: '{}^{0}T_{n}(\theta)=\prod_{i=1}^{n}{}^{i-1}T_{i}(\theta_i)'
    means: Multiply each joint's transform from the base out to the tool.
  - id: fk-two-link
    name: Planar 2-link arm
    tex: \begin{aligned}x&=l_1\cos\theta_1+l_2\cos(\theta_1+\theta_2)\\ y&=l_1\sin\theta_1+l_2\sin(\theta_1+\theta_2)\end{aligned}
    means: The second link points along $\theta_1+\theta_2$ because $\theta_2$ is measured from link 1.
  - id: dh-parameters
    name: Denavit–Hartenberg link transform
    tex: '{}^{i-1}T_{i}=\mathrm{Rot}_z(\theta_i)\,\mathrm{Trans}_z(d_i)\,\mathrm{Trans}_x(a_i)\,\mathrm{Rot}_x(\alpha_i)'
    means: Four numbers per joint ($\theta, d, a, \alpha$) describe any serial arm. Datasheets for industrial arms list them.
  - id: product-of-exponentials
    name: Product of exponentials
    tex: T(\theta)=e^{[\mathcal S_1]\theta_1}\,e^{[\mathcal S_2]\theta_2}\cdots e^{[\mathcal S_n]\theta_n}\,M
    means: '*Modern Robotics* form: $M$ is the tool pose at $\theta=0$ and each $\mathcal S_i$ is a joint''s screw axis in the base frame.'
  interactive:
    name: ArmFK
    title: Drive a 2-link arm
    caption: Move the joint sliders and trace the end-effector. Change the link lengths and watch the reachable ring shrink or grow.
  example:
    title: Where is the hand?
    body: |
      $l_1 = 1$ m, $l_2 = 0.7$ m, $\theta_1 = 30^\circ$, $\theta_2 = 45^\circ$ (so the second link points at $75^\circ$):

      $$x = \cos 30^\circ + 0.7\cos 75^\circ = 0.8660 + 0.1812 = 1.0472\text{ m}$$
      $$y = \sin 30^\circ + 0.7\sin 75^\circ = 0.5000 + 0.6761 = 1.1761\text{ m}$$

      The code below gets the same numbers by multiplying four $3\times3$ transforms, which is how it generalises to any arm.
  code:
    code: |-
      import numpy as np

      def se2(theta, x=0.0, y=0.0):
          c, s = np.cos(theta), np.sin(theta)
          return np.array([[c, -s, x], [s, c, y], [0, 0, 1.0]])

      def fk(thetas, lengths):
          """Chain of 'rotate joint, then move along link' transforms."""
          T = np.eye(3)
          for th, L in zip(thetas, lengths):
              T = T @ se2(th) @ se2(0, L, 0)
          return T[:2, 2]

      l1, l2 = 1.0, 0.7
      t1, t2 = np.radians(30), np.radians(45)
      print(np.round(fk([t1, t2], [l1, l2]), 4))          # [1.0472 1.1761]
      closed = [l1 * np.cos(t1) + l2 * np.cos(t1 + t2), l1 * np.sin(t1) + l2 * np.sin(t1 + t2)]
      print(np.allclose(fk([t1, t2], [l1, l2]), closed))  # True
  quiz:
  - q: For a serial arm, how many end-effector poses does one set of joint angles give?
    options:
    - Up to two
    - It depends on the gravity
    - Infinitely many
    - Exactly one
    answer: 3
    why: 'FK is a function: plug in the angles, multiply the matrices, get one pose. Multiple answers only appear in the inverse problem.'
  - q: A 2-link arm has $l_1 = 1$ m and $l_2 = 0.7$ m. Which distances from the base can the hand reach?
    options:
    - $0.7 \le r \le 1$ m
    - $0.3 \le r \le 1.7$ m
    - $0 \le r \le 1.7$ m
    - exactly $1.7$ m
    answer: 1
    why: Fully stretched gives $l_1+l_2$, fully folded gives $|l_1-l_2|$, and everything in between is reachable.
  - q: How many Denavit–Hartenberg parameters describe one joint?
    options:
    - '3'
    - '2'
    - '6'
    - '4'
    answer: 3
    why: '$\theta, d, a, \alpha$: two rotations and two translations, one of which is the joint variable.'
  deeper:
  - Modern Robotics (Northwestern, Coursera)
  - Stanford CS223A Introduction to Robotics
  - CS223A lecture playlist
  - Robotics Toolbox for Python (Peter Corke)
  build: Load a real arm's URDF (UR5, Panda or SO-101) in Robotics Toolbox for Python or Pinocchio and check its FK against your own chain of transforms.
- id: inverse-kinematics
  title: Inverse kinematics and Jacobians
  short: IK & Jacobians
  phase: 1 · Geometry
  minutes: 30
  summary: Given where the hand should go, which joint angles get it there? Inverse kinematics can have zero, two or infinitely many answers, and the Jacobian tells you how the hand moves when the joints do.
  body: |
    **Inverse kinematics (IK)** runs FK backwards: given a target, find joint angles that reach it. Unlike FK it can have no solution (out of reach), several (elbow up or elbow down), or infinitely many (a 7-joint arm can move its elbow while the hand stays still).

    ### Closed form for 2 links

    The triangle base–elbow–hand gives $\theta_2$ by the law of cosines. If the cosine comes out larger than 1 in magnitude, the target is out of reach. The sign of $\theta_2$ picks the elbow-up or elbow-down branch, and $\theta_1$ follows from two `atan2`s.

    ### The Jacobian

    Differentiate FK with respect to time and you get the **Jacobian**: a matrix $J(\theta)$ that maps joint velocities to hand velocity, $\dot x = J(\theta)\,\dot\theta$. Each column is "how the hand moves if only this joint moves". It changes as the arm moves.

    When $\det J = 0$ the arm is at a **singularity**: some hand direction cannot be produced at all, however fast the joints spin. For two links $\det J = l_1 l_2 \sin\theta_2$, zero when the arm is fully stretched or folded. Near a singularity, asking for a small hand motion demands huge joint speeds. The ellipse in the interactive visualises this: it collapses to a line.

    ### Numerical IK

    Real 6-7 joint arms rarely have a tidy closed form, so most solvers iterate: measure the error $e$, step $\Delta\theta = J^{+}e$, repeat. The plain pseudo-inverse explodes near singularities, so practical solvers use **damped least squares** (Levenberg–Marquardt): a small $\lambda$ trades a little accuracy for stability. MoveIt's default IK plugins (KDL, TRAC-IK, pick_ik) are numerical.

    The same matrix also does **statics**: to push with force $F$ at the hand, the joints need torques $\tau = J^\top F$.
  equations:
  - id: ik-elbow
    name: Elbow angle (law of cosines)
    tex: \cos\theta_2=\frac{x^2+y^2-l_1^2-l_2^2}{2\,l_1 l_2},\qquad \theta_2=\pm\arccos(\cdot)
    means: Two signs, two solutions (elbow up / down). If $|\cos\theta_2|>1$ the target is out of reach.
  - id: ik-shoulder
    name: Shoulder angle
    tex: \theta_1=\operatorname{atan2}(y,x)-\operatorname{atan2}\!\big(l_2\sin\theta_2,\; l_1+l_2\cos\theta_2\big)
    means: Aim at the target, then correct for the bend at the elbow. Always use `atan2`, never `atan`.
  - id: jacobian-2link
    name: Jacobian of the 2-link arm
    tex: J(\theta)=\begin{bmatrix}-l_1 s_1-l_2 s_{12} & -l_2 s_{12}\\ l_1 c_1+l_2 c_{12} & l_2 c_{12}\end{bmatrix},\quad \det J=l_1 l_2\sin\theta_2
    means: '$s_{12}=\sin(\theta_1+\theta_2)$ and so on. $\dot x = J\dot\theta$. The determinant vanishes at $\theta_2 = 0$ or $\pi$: singular.'
  - id: damped-least-squares
    name: Damped least-squares IK step
    tex: \Delta\theta=J^\top\big(JJ^\top+\lambda^2 I\big)^{-1}e
    means: Move the joints to shrink the hand error $e$. $\lambda$ keeps the step finite near singularities.
  - id: jacobian-statics
    name: Forces through the Jacobian
    tex: \tau=J^\top(\theta)\,F
    means: Joint torques needed to apply force $F$ at the hand. The same matrix, transposed.
  interactive:
    name: ArmIK
    title: 'Drag the target: IK, Jacobian and singularities'
    caption: Drag the ring. The dashed arm is the other IK solution. Push the target to full stretch and watch $\det J \to 0$ and the ellipse flatten. Switch to **Numerical (DLS)** to watch the iterations converge.
  example:
    title: Reach (1.2, 0.8) with l₁ = 1 m, l₂ = 0.75 m
    body: |
      $$\cos\theta_2 = \frac{1.44 + 0.64 - 1 - 0.5625}{2 \cdot 1 \cdot 0.75} = \frac{0.5175}{1.5} = 0.345 \;\Rightarrow\; \theta_2 = \pm 69.82^\circ$$

      Elbow up ($\theta_2 = -69.82^\circ$): $\theta_1 = \operatorname{atan2}(0.8, 1.2) - \operatorname{atan2}(0.75\sin(-69.82^\circ),\, 1 + 0.75\cos(-69.82^\circ)) = 62.91^\circ$.

      Elbow down ($\theta_2 = +69.82^\circ$): $\theta_1 = 4.47^\circ$. Both reach $(1.2, 0.8)$ exactly; plug them into FK to check. Here $|\det J| = 0.75 \cdot |\sin 69.82^\circ| = 0.704$: comfortably far from a singularity.
  code:
    code: |-
      import numpy as np

      l1, l2 = 1.0, 0.75

      def fk(q):
          t1, t2 = q
          return np.array([l1 * np.cos(t1) + l2 * np.cos(t1 + t2), l1 * np.sin(t1) + l2 * np.sin(t1 + t2)])

      def jacobian(q):
          t1, t2 = q
          s1, c1, s12, c12 = np.sin(t1), np.cos(t1), np.sin(t1 + t2), np.cos(t1 + t2)
          return np.array([[-l1 * s1 - l2 * s12, -l2 * s12], [l1 * c1 + l2 * c12, l2 * c12]])

      def ik_closed_form(x, y, elbow_up=True):
          c2 = (x * x + y * y - l1**2 - l2**2) / (2 * l1 * l2)
          if abs(c2) > 1:
              raise ValueError("target out of reach")
          t2 = (-1 if elbow_up else 1) * np.arccos(c2)
          t1 = np.arctan2(y, x) - np.arctan2(l2 * np.sin(t2), l1 + l2 * np.cos(t2))
          return np.array([t1, t2])

      def ik_dls(target, q=np.array([0.2, 0.4]), lam=0.05, iters=200):
          """Damped least squares: dq = J^T (J J^T + lam^2 I)^-1 e."""
          for _ in range(iters):
              e = target - fk(q)
              J = jacobian(q)
              q = q + J.T @ np.linalg.solve(J @ J.T + lam**2 * np.eye(2), e)
          return q

      target = np.array([1.2, 0.8])
      q = ik_closed_form(*target)
      print(np.round(np.degrees(q), 2), np.round(fk(q), 6))   # [ 62.91 -69.82] [1.2 0.8]
      q2 = ik_dls(target)
      print(np.round(fk(q2), 6), "det J =", round(np.linalg.det(jacobian(q2)), 3))
  quiz:
  - q: How many IK solutions does a 2-link planar arm usually have for a reachable target inside its workspace?
    options:
    - Infinitely many
    - Exactly one
    - Two (elbow up and elbow down)
    - None
    answer: 2
    why: The $\pm$ in $\theta_2 = \pm\arccos(\cdot)$ gives two mirror-image configurations; they merge into one only on the workspace boundary.
  - q: What does $\det J = 0$ mean physically?
    options:
    - 'A singularity: the hand cannot move in some direction, whatever the joints do'
    - The arm has zero mass
    - The joints are at their limits
    - The arm is out of reach of the target
    answer: 0
    why: The columns of J become parallel, so all joint motions push the hand along the same line.
  - q: Why add the damping term λ in numerical IK?
    options:
    - To add friction to the simulation
    - To make the solution exact
    - To keep joint steps finite near singularities
    - To find the elbow-down solution
    answer: 2
    why: $(JJ^\top)^{-1}$ blows up when $J$ is nearly singular; adding $\lambda^2 I$ bounds the step at the cost of slightly slower convergence.
  deeper:
  - Modern Robotics (Northwestern, Coursera)
  - 'PennX: Robotics: Kinematics and Mathematical Foundations'
  - Stanford CS223A Introduction to Robotics
  - Robotics Toolbox for Python (Peter Corke)
  build: 'Make a 2-servo arm (or a simulated one) draw a circle: sample points, run IK on each, and send the angles at a fixed rate. Then make it draw through a singularity and see what goes wrong.'
- id: dynamics
  title: 'Dynamics: forces, torques and motion'
  short: Dynamics basics
  phase: 2 · Physics & control
  minutes: 25
  summary: Kinematics says where things are; dynamics says why they move. Newton, the pendulum, and the one equation behind every robot arm and simulator.
  body: |
    Kinematics ignores mass. **Dynamics** connects forces and torques to motion. For a point mass it is Newton's $F = ma$; for something rotating about a joint it is $\tau = I\alpha$: torque equals inertia times angular acceleration.

    ### The pendulum, the hydrogen atom of robotics

    A mass $m$ on a rod of length $L$ feels gravity $mg$. Only the component perpendicular to the rod, $mg\sin\theta$, turns it, at lever arm $L$. With inertia $mL^2$:

    $$mL^2\ddot\theta = -mgL\sin\theta - b\dot\theta \quad\Rightarrow\quad \ddot\theta = -\frac{g}{L}\sin\theta - c\,\dot\theta$$

    The mass cancels: a heavy and a light pendulum swing identically. For small angles $\sin\theta \approx \theta$, the motion is a pure sine and the period is $T = 2\pi\sqrt{L/g}$. For big swings the real (nonlinear) period is longer: released from $90^\circ$ it is 18 % longer. That gap between the linear approximation and reality is a theme you will meet again in control.

    With no friction, total energy $E = \tfrac12 mL^2\dot\theta^2 + mgL(1-\cos\theta)$ is constant; it just sloshes between kinetic and potential.

    ### Robot arms

    Every rigid robot obeys the same structure, the **manipulator equation**:

    $$M(q)\,\ddot q + C(q,\dot q)\,\dot q + g(q) = \tau$$

    $M(q)$ is the mass matrix (inertia, which changes as the arm reconfigures), $C$ holds Coriolis and centrifugal effects, $g(q)$ is gravity, and $\tau$ is what the motors supply. Run it forward ("given torques, how does it move?") and you have a **simulator**. Run it backward ("which torques produce this motion?"), called **inverse dynamics**, and you have the feedforward term used by good controllers. The usual way to derive it is the **Lagrangian**: kinetic minus potential energy.
  equations:
  - id: pendulum-equation
    name: Pendulum with damping
    tex: \ddot\theta=-\frac{g}{L}\sin\theta-c\,\dot\theta
    means: Nonlinear because of $\sin\theta$. The mass cancels out.
  - id: small-angle-period
    name: Small-angle period
    tex: T\approx 2\pi\sqrt{\frac{L}{g}}
    means: Valid when $\sin\theta\approx\theta$. A 1 m pendulum takes about 2.006 s per swing cycle.
  - id: manipulator-equation
    name: Manipulator equation
    tex: M(q)\,\ddot q+C(q,\dot q)\,\dot q+g(q)=\tau
    means: Inertia, velocity coupling, gravity, motor torques. Simulators integrate it forward; controllers invert it.
  - id: euler-lagrange
    name: Euler–Lagrange equation
    tex: \frac{d}{dt}\frac{\partial \mathcal L}{\partial \dot q}-\frac{\partial \mathcal L}{\partial q}=\tau,\qquad \mathcal L=T-V
    means: Write kinetic energy $T$ and potential energy $V$, differentiate, and the equations of motion fall out.
  interactive:
    name: Pendulum
    title: A real (nonlinear) pendulum
    caption: Release it from a small angle and from $150^\circ$ and compare the measured period with $2\pi\sqrt{L/g}$. Set damping to 0 and watch the total-energy bar stay flat.
  example:
    title: How long is one swing?
    body: |
      For $L = 1$ m: $T = 2\pi\sqrt{1/9.81} = 2.006$ s.

      Released from $90^\circ$ the small-angle assumption is badly wrong ($\sin 90^\circ = 1$, not $1.571$). Integrating the full equation gives $T = 2.368$ s, a factor of $1.180$. The code below reproduces both numbers with SciPy's ODE solver, and the interactive shows the same ratio live.
  code:
    code: |-
      import numpy as np
      from scipy.integrate import solve_ivp

      g, L, c = 9.81, 1.0, 0.0   # gravity, length (m), damping (1/s)

      def pendulum(t, s):
          theta, omega = s
          return [omega, -(g / L) * np.sin(theta) - c * omega]

      def period(theta0):
          sol = solve_ivp(pendulum, (0, 10), [theta0, 0.0], rtol=1e-10, atol=1e-12, dense_output=True)
          t = np.linspace(0, 10, 200_001)
          th = sol.sol(t)[0]
          up = np.where((th[:-1] < 0) & (th[1:] >= 0))[0]   # upward zero crossings
          return t[up[1]] - t[up[0]]

      T0 = 2 * np.pi * np.sqrt(L / g)
      print(f"small-angle formula: {T0:.4f} s")              # 2.0061 s
      print(f"simulated, 5 deg:    {period(np.radians(5)):.4f} s")
      print(f"simulated, 90 deg:   {period(np.radians(90)):.4f} s  ({period(np.radians(90)) / T0:.3f}x)")
  quiz:
  - q: Which of these changes a pendulum's small-angle period?
    options:
    - How far you pull it back (if small)
    - Its length
    - The material of the bob
    - Its mass
    answer: 1
    why: '$T = 2\pi\sqrt{L/g}$: only length and gravity. Mass cancels, and for small angles amplitude does not matter.'
  - q: An arm holds still, $\dot q = \ddot q = 0$. Which term of $M\ddot q + C\dot q + g(q) = \tau$ do the motors still have to supply?
    options:
    - None, it costs nothing to hold still
    - $M(q)\ddot q$
    - $C(q,\dot q)\dot q$
    - $g(q)$, gravity compensation
    answer: 3
    why: With no motion the first two terms vanish, but gravity still pulls. That torque is why arms get hot holding a pose.
  - q: Release a pendulum from $90^\circ$ instead of $5^\circ$. Its period is…
    options:
    - The same
    - Longer (about 18 %)
    - Twice as long
    - Shorter
    answer: 1
    why: 'The restoring torque grows like $\sin\theta$, which is less than $\theta$ for big angles, so it swings back more slowly: 2.368 s vs 2.006 s for 1 m.'
  deeper:
  - MIT 2.003SC Engineering Dynamics
  - ETH Zurich Robot Dynamics
  - Underactuated Robotics (Russ Tedrake, MIT)
  - Modern Robotics book and videos
  build: Hang your phone from a string, log its accelerometer with a free app, measure the period, and compare with $2\pi\sqrt{L/g}$. Then try a big amplitude.
- id: pid-control
  title: PID control
  short: PID control
  phase: 2 · Physics & control
  minutes: 30
  summary: The controller inside nearly every motor, drone and thermostat. Measure the error, push proportionally, damp with the derivative, and remove the leftover with the integral.
  body: |
    A controller closes the loop: measure where you are, compare with where you want to be, push. The error is $e = r - y$ (setpoint minus measurement), and the **PID** controller computes the push from three terms:

    - **P, proportional**, $K_p e$: a spring pulling towards the target. More $K_p$ means faster, but more overshoot and oscillation.
    - **D, derivative**, $-K_d\dot y$: a damper that resists motion. It brakes before you overshoot. It also amplifies sensor noise, so it is usually filtered.
    - **I, integral**, $K_i\int e\,dt$: memory. A constant disturbance (gravity on an arm, a headwind on a drone) leaves a steady error that P alone can't remove; the integral keeps growing until it does.

    ### Why it overshoots: the second-order picture

    Put a P controller on a mass $m$ with friction $b$ ($m\ddot x + b\dot x = u$). The closed loop becomes a mass-spring-damper with natural frequency $\omega_n = \sqrt{K_p/m}$ and damping ratio $\zeta = (b + K_d)/(2\sqrt{mK_p})$. The percentage overshoot depends only on $\zeta$. With $\zeta = 1$ (**critical damping**) you get the fastest response with no overshoot, which tells you exactly how much $K_d$ to add.

    ### Making it work on hardware

    - Take the derivative of the **measurement**, not the error, so a setpoint jump doesn't cause a huge "derivative kick".
    - Motors saturate. If the integral keeps accumulating while the motor is maxed out, it **winds up** and causes a huge overshoot later. Stop integrating while saturated (**anti-windup**).
    - Run the loop at a fixed rate (often 100 Hz to 10 kHz) and low-pass filter the D term.

    A practical tuning order: raise $K_p$ until it is quick with some overshoot, add $K_d$ until the overshoot is gone, then add a little $K_i$ to remove the steady error.
  equations:
  - id: pid-law
    name: PID control law
    tex: u(t)=K_p\,e(t)+K_i\int_0^t e(\tau)\,d\tau-K_d\,\dot y(t),\qquad e=r-y
    means: Proportional, integral and derivative (on the measurement) terms add up to the motor command $u$.
  - id: closed-loop-second-order
    name: P-D loop on a mass with friction
    tex: \ddot x+\frac{b+K_d}{m}\dot x+\frac{K_p}{m}x=\frac{K_p}{m}r,\quad \omega_n=\sqrt{\tfrac{K_p}{m}},\;\zeta=\frac{b+K_d}{2\sqrt{mK_p}}
    means: The controller turns the cart into a virtual spring ($K_p$) and damper ($b+K_d$).
  - id: percent-overshoot
    name: Overshoot of a second-order system
    tex: \%OS=100\,\exp\!\Big(\frac{-\zeta\pi}{\sqrt{1-\zeta^2}}\Big)
    means: 'Only depends on the damping ratio: $\zeta=0.158$ gives about 60 %; $\zeta\ge 1$ gives none.'
  - id: critical-damping-gain
    name: Derivative gain for critical damping
    tex: \zeta=1\;\Rightarrow\;K_d=2\sqrt{mK_p}-b
    means: The smallest $K_d$ that removes overshoot for a given $K_p$.
  interactive:
    name: PidTuner
    title: 'PID tuner: a 1 kg cart with friction'
    caption: 'Start with **P only** (60 % overshoot), then press **PD** (critically damped). Turn on the push at 7 s: with $K_i = 0$ a steady error remains. Add sensor noise and see why big $K_d$ hurts.'
  example:
    title: Predict the overshoot before you simulate
    body: |
      Cart: $m = 1$ kg, $b = 1$ N·s/m. P control with $K_p = 10$:

      $$\omega_n = \sqrt{10} = 3.162\ \text{rad/s},\qquad \zeta = \frac{1}{2\sqrt{10}} = 0.158,\qquad \%OS = 100\,e^{-0.158\pi/\sqrt{1-0.025}} = 60.5\,\%$$

      The simulation in the interactive measures 60.45 %. To remove the overshoot, add $K_d = 2\sqrt{10} - 1 = 5.32$ for $\zeta = 1$: that is the **PD** preset, and it reaches the target with 0 % overshoot.
  code:
    code: |-
      import numpy as np

      class PID:
          def __init__(self, kp, ki, kd, dt, u_max=np.inf):
              self.kp, self.ki, self.kd, self.dt, self.u_max = kp, ki, kd, dt, u_max
              self.integral, self.prev_y = 0.0, None

          def __call__(self, setpoint, y):
              e = setpoint - y
              dy = 0.0 if self.prev_y is None else (y - self.prev_y) / self.dt   # derivative on measurement
              self.prev_y = y
              u = self.kp * e + self.ki * self.integral - self.kd * dy
              u_sat = np.clip(u, -self.u_max, self.u_max)
              if u == u_sat:                      # anti-windup: only integrate when not saturated
                  self.integral += e * self.dt
              return u_sat

      def step_response(kp, ki, kd, m=1.0, b=1.0, dt=0.001, t_end=10.0):
          pid, x, v, ys = PID(kp, ki, kd, dt), 0.0, 0.0, []
          for _ in range(int(t_end / dt)):
              u = pid(1.0, x)
              v += (u - b * v) / m * dt          # m x'' = u - b x'
              x += v * dt
              ys.append(x)
          return np.array(ys)

      for name, gains in {"P": (10, 0, 0), "PD (critically damped)": (10, 0, 2 * np.sqrt(10) - 1), "PID": (12, 4, 5)}.items():
          y = step_response(*gains)
          print(f"{name:24s} overshoot {100 * max(0, y.max() - 1):5.1f} %   final {y[-1]:.3f}")
      # P: ~60.5 % overshoot, as predicted by exp(-zeta*pi/sqrt(1-zeta^2)) with zeta = 0.158
  quiz:
  - q: A drone holds altitude but sits 10 cm too low because of its weight. Which term removes that steady error?
    options:
    - Integral
    - Derivative
    - None can
    - Proportional
    answer: 0
    why: A constant disturbance needs a constant extra push even at zero error; only the integral term can supply that.
  - q: Increasing $K_d$ mostly…
    options:
    - makes the response faster with more overshoot
    - removes steady-state error
    - 'adds damping: less overshoot, but more noise sensitivity'
    - has no effect on a mass
    answer: 2
    why: $K_d$ enters the damping ratio $\zeta=(b+K_d)/(2\sqrt{mK_p})$. It also differentiates sensor noise, so too much makes the motor buzz.
  - q: What is integral windup?
    options:
    - The integral grows while the actuator is saturated, causing a big overshoot afterwards
    - The motor overheating
    - Gears backlashing
    - The derivative term reacting to a setpoint jump
    answer: 0
    why: While the motor is maxed out, the error persists and the integral keeps growing. When the system finally arrives, the huge integral drives it far past the target. Anti-windup stops integrating while saturated.
  deeper:
  - 'Brian Douglas: control lectures'
  - MIT 6.302 Feedback Systems
  - Feedback Systems (Åström & Murray)
  - Control Bootcamp (Steve Brunton)
  build: Hold a DC motor's position (or a ball on a tilting beam) with a fixed-rate PID loop on an Arduino. Log the step response and measure the overshoot you predicted.
- id: state-space-lqr
  title: State space and LQR
  short: State space & LQR
  phase: 2 · Physics & control
  minutes: 30
  summary: When several states interact, like a pole balanced on a moving cart, you control them all at once. LQR finds the best gains by trading error against effort.
  body: |
    PID handles one input and one output. Many robots are coupled systems: balancing a pole on a cart means controlling the cart position, its speed, the pole angle and its rate, all with one motor. **State space** writes the whole system as a vector equation:

    $$\dot x = Ax + Bu$$

    For the cart-pole the state is $x = (p, \dot p, \theta, \dot\theta)$. The real dynamics are nonlinear, so we **linearise** around the upright equilibrium ($\sin\theta \approx \theta$, $\cos\theta \approx 1$). The open-loop $A$ has an eigenvalue at $+4.85$ for our parameters: a positive eigenvalue means the pole falls exponentially.

    ### Full-state feedback

    Feed back every state, $u = -Kx$, and the closed loop becomes $\dot x = (A - BK)x$. It is stable when every eigenvalue of $A - BK$ has a negative real part. If the system is **controllable** you can place those eigenvalues anywhere, but where *should* they go?

    ### LQR: the best K for a cost you choose

    The **linear quadratic regulator** picks $K$ to minimise

    $$J = \int_0^\infty \big(x^\top Q x + u^\top R u\big)\,dt$$

    $Q$ says which errors you care about (large weight on $\theta$ means "keep the pole upright above all"); $R$ says how expensive force is. The optimal $K$ comes from the **Riccati equation**, one line in SciPy or python-control. Raise $R$ and the controller becomes gentle and lazy; raise $Q$ and it becomes aggressive.

    A quirk you'll see in the interactive: to move the cart right, LQR first nudges it *left* so the pole tilts the right way. That's not a bug; it is the optimal answer for this non-minimum-phase system.

    **MPC** (model predictive control) extends the idea: solve a finite-horizon version of this optimisation online, every few milliseconds, *with constraints* such as motor limits. It runs on quadrupeds, drones and self-driving cars.
  equations:
  - id: state-space
    name: Linear state-space model
    tex: \dot x=Ax+Bu,\qquad y=Cx
    means: Everything about the system's memory lives in the state vector $x$.
  - id: cart-pole-linear
    name: Cart-pole, linearised upright
    tex: A=\begin{bmatrix}0&1&0&0\\0&0&-\tfrac{mg}{M}&0\\0&0&0&1\\0&0&\tfrac{(M+m)g}{Ml}&0\end{bmatrix},\; B=\begin{bmatrix}0\\ \tfrac{1}{M}\\0\\-\tfrac{1}{Ml}\end{bmatrix}
    means: Cart mass $M$, point mass $m$ at the tip of a massless pole of length $l$, $\theta$ measured from upright.
  - id: lqr-cost
    name: LQR cost
    tex: J=\int_0^\infty\big(x^\top Qx+u^\top Ru\big)\,dt
    means: $Q$ penalises state error, $R$ penalises effort. You tune the trade-off, not the gains.
  - id: riccati
    name: Algebraic Riccati equation and optimal gain
    tex: A^\top P+PA-PBR^{-1}B^\top P+Q=0,\qquad K=R^{-1}B^\top P
    means: 'Solve for $P$ (SciPy: `solve_continuous_are`), then $u=-Kx$ is optimal.'
  - id: closed-loop-stability
    name: Closed-loop stability
    tex: \dot x=(A-BK)\,x\ \text{ is stable}\iff \operatorname{Re}\lambda_i(A-BK)<0\ \ \forall i
    means: 'All eigenvalues in the left half-plane. In discrete time: inside the unit circle.'
  interactive:
    name: LqrCartPole
    title: Balance a cart-pole with LQR
    caption: Push the pole, move the cart target, then turn the controller off and watch it fall. Lower $R$ for aggressive control; raise it and the cart gets lazy. The gain $K$ is re-solved from the Riccati equation every time you move a slider.
  example:
    title: The numbers behind the interactive
    body: |
      With $M = 1$ kg, $m = 0.2$ kg, $l = 0.5$ m, the open-loop eigenvalues are $0, 0, \pm 4.85$. The $+4.85$ is the pole falling: its tilt grows like $e^{4.85t}$, doubling every 0.14 s.

      Choosing $Q = \mathrm{diag}(10, 1, 100, 1)$ and $R = 0.1$, the Riccati equation gives

      $$K = \begin{bmatrix}-10.0 & -11.66 & -73.54 & -14.83\end{bmatrix}$$

      and closed-loop eigenvalues $-7.68 \pm 3.33i$ and $-1.33 \pm 1.02i$: all in the left half-plane, so the pole is balanced. The code below also runs the full nonlinear model from $15^\circ$ and ends upright.
  code:
    code: |-
      import numpy as np
      from scipy.linalg import solve_continuous_are
      from scipy.integrate import solve_ivp

      M, m, l, g = 1.0, 0.2, 0.5, 9.81   # cart, pole tip mass, pole length, gravity

      # Linearised about the upright pole; state x = [cart pos, cart vel, pole angle, pole rate]
      A = np.array([[0, 1, 0, 0],
                    [0, 0, -m * g / M, 0],
                    [0, 0, 0, 1],
                    [0, 0, (M + m) * g / (M * l), 0]])
      B = np.array([[0], [1 / M], [0], [-1 / (M * l)]])

      Q = np.diag([10, 1, 100, 1])   # care most about the pole angle
      R = np.array([[0.1]])          # force is cheap-ish
      P = solve_continuous_are(A, B, Q, R)
      K = np.linalg.solve(R, B.T @ P)
      print("K =", K.round(2))                                   # [[-10.  -11.66 -73.54 -14.83]]
      print("open-loop poles:  ", np.linalg.eigvals(A).round(2))  # one at +4.85 -> falls
      print("closed-loop poles:", np.linalg.eigvals(A - B @ K).round(2))

      def nonlinear(t, s):
          x, xd, th, thd = s
          u = float((-K @ s)[0])
          xdd = (u + m * np.sin(th) * (l * thd**2 - g * np.cos(th))) / (M + m * np.sin(th) ** 2)
          return [xd, xdd, thd, (g * np.sin(th) - xdd * np.cos(th)) / l]

      sol = solve_ivp(nonlinear, (0, 6), [0, 0, np.radians(15), 0], max_step=0.01)
      print("pole angle after 6 s: %.5f rad" % sol.y[2, -1])     # ~0: balanced
  quiz:
  - q: You increase $R$ (the cost of force) in LQR. The controller becomes…
    options:
    - more aggressive
    - unchanged
    - unstable
    - gentler and slower, using less force
    answer: 3
    why: Effort is now expensive, so the optimum accepts larger state errors in exchange for smaller $u$.
  - q: The closed loop $\dot x = (A-BK)x$ is stable when…
    options:
    - $\det(A-BK)=0$
    - every eigenvalue of $A-BK$ has a negative real part
    - every entry of $K$ is positive
    - $Q$ is larger than $R$
    answer: 1
    why: Solutions are combinations of $e^{\lambda t}$; they decay only if every $\operatorname{Re}\lambda<0$.
  - q: Why linearise the cart-pole before designing LQR?
    options:
    - Because nonlinear systems cannot be simulated
    - Linearising makes the pole stable on its own
    - To remove the cart from the model
    - LQR needs a linear model; the linearisation is accurate near the upright equilibrium
    answer: 3
    why: The Riccati solution assumes $\dot x = Ax + Bu$. It works well as long as the pole stays near upright; far away, $\sin\theta\ne\theta$.
  deeper:
  - Control Bootcamp (Steve Brunton)
  - Underactuated Robotics (Russ Tedrake, MIT)
  - 'Model Predictive Control: Theory, Computation, and Design'
  - 'PennX: Robotics: Dynamics and Control'
  build: Design LQR for a two-wheeled self-balancing robot model with python-control, simulate it with a motor torque limit, and find the largest push it survives.
- id: kalman-filter
  title: Sensors and the Kalman filter
  short: Sensors & Kalman filter
  phase: 2 · Physics & control
  minutes: 30
  summary: Every sensor lies a little. The Kalman filter blends a motion model with noisy measurements, weighting each by how much it can be trusted.
  body: |
    Robots sense the world through imperfect instruments:

    | Sensor | Measures | Typical problem |
    | --- | --- | --- |
    | Wheel / joint encoders | rotation | slip, calibration error, drift over distance |
    | IMU (gyro + accelerometer) | angular rate, acceleration | gyro bias: integrated heading drifts |
    | GPS | position | metre-level noise, dropouts indoors |
    | Lidar | ranges | glass, rain, few-cm noise |
    | Camera | images | lighting, motion blur, no direct depth |

    No single sensor is good enough, so we **fuse** them. The Kalman filter keeps two things: a best guess $\hat x$ and its uncertainty, the covariance $P$. Each step has two halves:

    1. **Predict.** Push the estimate through the motion model. Uncertainty grows: $P \leftarrow FPF^\top + Q$, where $Q$ is how much you distrust the model.
    2. **Update.** A measurement $z$ arrives with noise covariance $R$. Compute the **Kalman gain** $K$ and move the estimate toward the measurement by a fraction $K$ of the surprise $z - H\hat x$. Uncertainty shrinks.

    In one dimension the gain is just $K = P/(P + R)$: if you are unsure ($P$ large) and the sensor is good ($R$ small), trust the sensor; otherwise trust your prediction. Fusing two Gaussian guesses always gives an answer **more certain than either**.

    Tuning is mostly choosing $Q$ and $R$. $Q$ too small and the filter trusts its model, so it lags behind real manoeuvres; $Q$ too big and it just follows the noisy sensor. Try both in the interactive.

    Robots are nonlinear, so in practice you'll use the **extended** Kalman filter (linearise with Jacobians each step) or the **unscented** one. In ROS 2 the `robot_localization` package fuses wheel odometry, IMU and GPS with an EKF or UKF out of the box.
  equations:
  - id: kf-predict
    name: Predict
    tex: \hat x^-=F\hat x,\qquad P^-=FPF^\top+Q
    means: Move the estimate with the model; add process noise $Q$ to the uncertainty.
  - id: kf-gain
    name: Kalman gain
    tex: K=P^-H^\top\big(HP^-H^\top+R\big)^{-1}
    means: How much to trust this measurement, given current uncertainty $P^-$ and sensor noise $R$.
  - id: kf-update
    name: Update
    tex: \hat x=\hat x^-+K\big(z-H\hat x^-\big),\qquad P=(I-KH)\,P^-
    means: Correct by a fraction of the innovation $z-H\hat x^-$; the uncertainty shrinks.
  - id: gaussian-fusion
    name: Fusing two noisy estimates
    tex: \hat x=\frac{\sigma_2^2x_1+\sigma_1^2x_2}{\sigma_1^2+\sigma_2^2},\qquad \sigma^2=\frac{\sigma_1^2\sigma_2^2}{\sigma_1^2+\sigma_2^2}
    means: A weighted average that leans toward the more precise source. The fused $\sigma$ is smaller than both.
  interactive:
    name: Kalman1D
    title: Kalman filter on a noisy range sensor
    caption: Crank the sensor noise and the filter still tracks the truth, with an honest $\pm 2\sigma$ band. Then mis-tune $q$ to $10^{-3}$ (laggy) or $10^{3}$ (jittery) and watch the error grow.
  example:
    title: GPS + odometry
    body: |
      GPS says you are at $10.0$ m ($\sigma = 3$ m). Wheel odometry predicts $12.0$ m ($\sigma = 1$ m).

      $$\hat x = \frac{3^2\cdot 12 + 1^2 \cdot 10}{1^2 + 3^2} = \frac{118}{10} = 11.8\text{ m},\qquad \sigma = \sqrt{\frac{9\cdot 1}{10}} = 0.95\text{ m}$$

      As a Kalman update: $K = P/(P+R) = 1/(1+9) = 0.1$, so $\hat x = 12 + 0.1\,(10 - 12) = 11.8$ m. The fused estimate is more certain (0.95 m) than even the better sensor alone (1 m).
  code:
    code: |-
      import numpy as np

      rng = np.random.default_rng(0)
      dt, n, q, sigma = 0.1, 300, 1.0, 2.0      # step, steps, process noise, sensor noise (m)

      F = np.array([[1, dt], [0, 1]])           # constant-velocity model
      H = np.array([[1.0, 0.0]])                # we only measure position
      Q = q * np.array([[dt**3 / 3, dt**2 / 2], [dt**2 / 2, dt]])
      R = np.array([[sigma**2]])

      x_true = np.array([0.0, 1.0])
      x, P = np.zeros(2), np.eye(2) * 10.0
      err_meas, err_kf = [], []
      for _ in range(n):
          x_true = F @ x_true + rng.multivariate_normal([0, 0], Q)
          z = H @ x_true + rng.normal(0, sigma, 1)
          # predict
          x, P = F @ x, F @ P @ F.T + Q
          # update
          S = H @ P @ H.T + R
          K = P @ H.T @ np.linalg.inv(S)
          x = x + K @ (z - H @ x)
          P = (np.eye(2) - K @ H) @ P
          err_meas.append(z[0] - x_true[0]); err_kf.append(x[0] - x_true[0])

      rms = lambda e: np.sqrt(np.mean(np.square(e)))
      print(f"sensor RMSE {rms(err_meas):.2f} m  ->  Kalman RMSE {rms(err_kf):.2f} m, gain K = {K[0, 0]:.3f}")
  quiz:
  - q: The sensor noise $R$ goes up. The Kalman gain $K$…
    options:
    - stays the same
    - becomes negative
    - 'goes down: trust the measurements less'
    - goes up
    answer: 2
    why: In 1-D, $K = P/(P+R)$. A noisier sensor gets a smaller weight.
  - q: You fuse two independent estimates with $\sigma_1 = 3$ m and $\sigma_2 = 1$ m. The fused $\sigma$ is about…
    options:
    - 0.95 m
    - 1 m
    - 4 m
    - 2 m
    answer: 0
    why: '$\sigma^2 = 9\cdot1/(9+1) = 0.9$, so $\sigma \approx 0.95$ m: better than either alone.'
  - q: Why does heading from integrating a gyro alone go wrong over time?
    options:
    - Gyros only work outdoors
    - Integration removes noise
    - Small biases integrate into an ever-growing drift
    - Gyros measure position, not rate
    answer: 2
    why: A bias of 0.01 °/s becomes 36° of heading error in an hour. Fusing with an absolute reference (magnetometer, GPS track, landmarks) bounds the error.
  deeper:
  - Kalman and Bayesian Filters in Python
  - State Estimation for Robotics (Barfoot)
  - Self-Driving Cars (U. Toronto, Coursera)
  - Robot Mapping (Cyrill Stachniss)
  build: Record a ROS 2 bag of wheel odometry and IMU (or use your phone's GPS and accelerometer), fuse them with robot_localization's EKF, and plot raw vs fused tracks.
- id: localization-slam
  title: Localization and SLAM
  short: Localization & SLAM
  phase: 3 · Autonomy
  minutes: 30
  summary: Wheel odometry drifts without limit. Particle filters lock the robot onto a known map, and SLAM builds the map while localizing in it.
  body: |
    ### Differential drive and odometry

    Most mobile robots steer by spinning two wheels at different speeds. With wheel speeds $v_L, v_R$ and wheel base $W$, the robot moves forward at $v = (v_R + v_L)/2$ and turns at $\omega = (v_R - v_L)/W$. Integrate those over time and you get **odometry**: dead reckoning from wheel encoders.

    Odometry drifts, and the error has no upper bound. A wheel that is 1 % larger than the other turns the robot slowly in a circle it doesn't know about. Slip on carpet, bumps and quantisation add more. After a few metres the robot is confidently wrong.

    ### Localization: Monte Carlo

    If you have a map, compare what the sensors see with what the map predicts. **Monte Carlo localization** (a particle filter) represents the belief as hundreds of guesses, the particles:

    1. **Move** every particle with the odometry, plus noise (we're not sure of the wheels).
    2. **Weight** every particle by how well the actual measurements match what that particle would see.
    3. **Resample**: clone the likely particles, drop the unlikely ones.

    Unlike a Kalman filter it can hold several hypotheses at once ("I'm in corridor A *or* B") and can recover from being picked up and moved. Nav2 in ROS 2 uses a version of it called **AMCL**.

    ### SLAM

    Without a map, the robot must build one while localizing in it: **simultaneous localization and mapping**. Modern SLAM has a *front end* that matches scans or tracks image features between frames, and a *back end* that solves a **pose graph**: nodes are robot poses, edges are measured relative motions, and an optimiser finds the poses that best agree with every edge. The key moment is **loop closure**: recognising a place you've been before adds an edge that pulls the whole accumulated drift back into shape.

    Tools you'll actually use: `slam_toolbox` (2-D lidar, ROS 2 default), Cartographer, RTAB-Map (RGB-D), ORB-SLAM3 (visual-inertial).
  equations:
  - id: diff-drive
    name: Differential-drive kinematics
    tex: v=\frac{v_R+v_L}{2},\qquad \omega=\frac{v_R-v_L}{W}
    means: Two wheel speeds become forward speed and turn rate. $W$ is the distance between the wheels.
  - id: odometry-update
    name: Odometry pose update
    tex: \begin{bmatrix}x\\y\\\theta\end{bmatrix}_{k+1}=\begin{bmatrix}x_k+v\,\Delta t\cos\theta_k\\ y_k+v\,\Delta t\sin\theta_k\\ \theta_k+\omega\,\Delta t\end{bmatrix}
    means: 'Dead reckoning: every small error is integrated forever.'
  - id: particle-weight
    name: Particle weight from landmark ranges
    tex: w^{[i]}\propto\prod_{j}\exp\!\Big(-\frac{(z_j-\hat z_j^{[i]})^2}{2\sigma^2}\Big)
    means: Particle $i$ predicts range $\hat z_j^{[i]}$ to landmark $j$; the closer to the real $z_j$, the higher its weight.
  - id: pose-graph
    name: Pose-graph SLAM
    tex: x^*=\arg\min_{x}\sum_{(i,j)}e_{ij}(x_i,x_j)^\top\,\Omega_{ij}\,e_{ij}(x_i,x_j)
    means: Find the trajectory that best agrees with all measured relative motions $e_{ij}$, each weighted by its confidence $\Omega_{ij}$.
  interactive:
    name: Localization
    title: Odometry drift vs a particle filter
    caption: Let it wander, or drive it yourself. Odometry (grey) slowly curves away from the truth (amber); the particle filter (accent) stays locked on by ranging to the diamonds. Untick the landmarks and watch the particles spread out.
  example:
    title: How far does a 1 % wheel error take you?
    body: |
      Wheel base $W = 0.35$ m, right wheel 1 % faster than it should be ($v_R = 1.01\,v_L$). The robot thinks it drives straight, but it actually follows a curve of curvature

      $$\kappa = \frac{\omega}{v} = \frac{0.01\,v_L/0.35}{1.005\,v_L} = 0.0284\ \text{rad/m}$$

      After 10 m the heading is off by $0.284$ rad $= 16.3^\circ$, and the robot is $(1-\cos 0.284)/0.0284 = 1.41$ m to the side of where odometry says. A 1 % calibration error became a 1.4 m position error in 10 m.
  code:
    code: |-
      import numpy as np

      rng = np.random.default_rng(1)
      W, dt, N = 0.35, 0.05, 500                       # wheel base (m), step (s), particles
      landmarks = np.array([[0, 0], [6, 0], [6, 4], [0, 4]], float)

      def drive(p, vl, vr):
          """Differential drive: v = (vr+vl)/2, w = (vr-vl)/W (works on one pose or an array)."""
          v, w = (vr + vl) / 2, (vr - vl) / W
          th = p[..., 2]
          return np.stack([p[..., 0] + v * np.cos(th) * dt, p[..., 1] + v * np.sin(th) * dt, th + w * dt], -1)

      truth = odom = np.array([1.0, 1.0, 0.0])
      parts = truth + rng.normal(0, [0.1, 0.1, 0.05], (N, 3))
      for k in range(400):
          vl, vr = 0.50, 0.58                           # gentle left curve
          truth = drive(truth, vl, vr)
          ml, mr = vl * 1.02 + rng.normal(0, 0.01), vr + rng.normal(0, 0.01)   # left encoder reads 2 % high
          odom = drive(odom, ml, mr)
          # particle filter: predict with noisy odometry, weight by landmark ranges, resample
          parts = drive(parts, ml * (1 + rng.normal(0, 0.05, N)), mr * (1 + rng.normal(0, 0.05, N)))
          z = np.linalg.norm(landmarks - truth[:2], axis=1) + rng.normal(0, 0.1, 4)
          d = np.linalg.norm(parts[:, None, :2] - landmarks[None], axis=2)
          w = np.exp(-0.5 * np.sum((d - z) ** 2, axis=1) / 0.2**2) + 1e-300
          w /= w.sum()
          parts = parts[rng.choice(N, N, p=w)]

      est = parts[:, :2].mean(axis=0)
      print(f"odometry error {np.linalg.norm(odom[:2] - truth[:2]):.2f} m, particle filter error {np.linalg.norm(est - truth[:2]):.2f} m")
  quiz:
  - q: Why can't a robot rely on wheel odometry alone for a long trip?
    options:
    - Encoders cannot measure speed
    - Small errors are integrated forever, so the error grows without bound
    - Odometry needs GPS to work
    - Odometry only works in simulation
    answer: 1
    why: Nothing ever corrects dead reckoning, so slip, bias and noise accumulate. An absolute reference (landmarks, a map, GPS) is needed to bound the error.
  - q: What does resampling do in a particle filter?
    options:
    - Sorts particles by age
    - Averages all particles into one
    - Adds random particles everywhere
    - Clones likely particles and discards unlikely ones
    answer: 3
    why: Sampling particles in proportion to their weights concentrates effort where the robot probably is.
  - q: In SLAM, a loop closure is…
    options:
    - closing the control loop around the wheels
    - recognising a previously visited place, which corrects accumulated drift
    - a bug where the map overlaps itself
    - the robot driving in a circle
    answer: 1
    why: The new constraint between now and a much older pose lets the optimiser redistribute the drift along the whole loop.
  deeper:
  - Robot Mapping (Cyrill Stachniss)
  - Introduction to Visual SLAM (slambook-en)
  - ETH Zurich Autonomous Mobile Robots
  - PythonRobotics
  build: Drive a TurtleBot3 in Gazebo, build a map with slam_toolbox, save it, then localize in it with Nav2's AMCL and send navigation goals from RViz.
- id: path-planning
  title: 'Path planning: A*, Dijkstra and friends'
  short: Path planning (A*)
  phase: 3 · Autonomy
  minutes: 25
  summary: Turn the map into a graph and search it. Dijkstra finds the cheapest path, A* finds the same path much faster with a good heuristic, and greedy search is fast but can be fooled.
  body: |
    Once a robot knows where it is on a map, it needs a route. The classic approach turns the map into a **graph**: each free cell of an occupancy grid is a node, moves to neighbours are edges with a cost (1 straight, $\sqrt2$ diagonal).

    - **Breadth-first search** explores in rings and finds the path with the fewest *steps*, ignoring that diagonals are longer.
    - **Dijkstra** always expands the cheapest unexplored node first, using its cost-so-far $g(n)$. It finds the cheapest path but explores in every direction equally.
    - **A\*** ranks nodes by $f(n) = g(n) + h(n)$, where $h$ is a heuristic estimate of the remaining cost. If $h$ **never overestimates** (it's *admissible*), A\* still returns the optimal path but explores far fewer nodes, because it leans toward the goal. Dijkstra is just A\* with $h = 0$.
    - **Greedy best-first** uses only $h$. It's often fast, but a wall in the wrong place sends it down a long detour.

    The heuristic must match the moves: Manhattan distance for 4-connected grids, **octile** distance for 8-connected, Euclidean for any-angle.

    ### What real planners add

    A robot isn't a point, so planners search a **costmap** where obstacles are inflated by the robot's radius (Nav2's inflation layer). Grids get huge in 3-D or for arms, so **sampling-based** planners (PRM, RRT, next chapter) take over there. And a global path isn't enough: a local controller (DWB, MPPI or Regulated Pure Pursuit in Nav2) follows it at 20 Hz while dodging people.
  equations:
  - id: astar-priority
    name: A* priority
    tex: f(n)=g(n)+h(n)
    means: Cost so far plus estimated cost to go. Expand the node with the smallest $f$.
  - id: admissible-heuristic
    name: Admissibility
    tex: 0\le h(n)\le h^*(n)\quad\forall n
    means: Never overestimate the true remaining cost $h^*$, and A* is guaranteed to return an optimal path.
  - id: octile-distance
    name: Octile distance (8-connected grid)
    tex: h=\Delta x+\Delta y+(\sqrt2-2)\min(\Delta x,\Delta y)
    means: 'Exact cost on an empty 8-connected grid: go diagonally as far as possible, then straight.'
  - id: relaxation
    name: Edge relaxation
    tex: g(v)\leftarrow\min\big(g(v),\;g(u)+c(u,v)\big)
    means: 'The core step shared by Dijkstra and A*: found a cheaper way to $v$ through $u$? Keep it.'
  interactive:
    name: GridPlanner
    title: Watch the search
    caption: 'Paint walls, drag S and G, and replay each algorithm. The table compares all four on your map: A* and Dijkstra always tie on path length, but A* expands far fewer cells. Greedy is fastest and sometimes wrong; BFS ignores that diagonals cost $\sqrt2$.'
  example:
    title: Is the octile heuristic exact on an empty grid?
    body: |
      From $(0,0)$ to $(5,3)$ on an empty 8-connected grid: go 3 diagonal steps to $(3,3)$, then 2 straight.

      $$\text{cost} = 3\sqrt2 + 2 = 6.243,\qquad h = 5 + 3 + (\sqrt2 - 2)\cdot 3 = 6.243$$

      Identical, so on open ground A\* walks straight to the goal and expands almost nothing else. Obstacles make the true cost larger than $h$, never smaller, so $h$ stays admissible and the path stays optimal.
  code:
    code: |-
      import heapq, math

      GRID = """
      S....#....
      .##..#.##.
      .#...#..#.
      .#.###..#.
      .#......#G
      """.split()

      def astar(grid):
          H, W = len(grid), len(grid[0])
          find = lambda ch: next((r, c) for r in range(H) for c in range(W) if grid[r][c] == ch)
          start, goal = find("S"), find("G")
          def h(p):  # octile distance: admissible for 8-connected moves
              dx, dy = abs(p[0] - goal[0]), abs(p[1] - goal[1])
              return dx + dy + (math.sqrt(2) - 2) * min(dx, dy)
          g, parent, closed = {start: 0.0}, {start: None}, set()
          frontier = [(h(start), start)]
          while frontier:
              _, cur = heapq.heappop(frontier)
              if cur in closed:
                  continue
              if cur == goal:
                  path = []
                  while cur:
                      path.append(cur); cur = parent[cur]
                  return path[::-1], g[goal], len(closed)
              closed.add(cur)
              for dr in (-1, 0, 1):
                  for dc in (-1, 0, 1):
                      nr, nc = cur[0] + dr, cur[1] + dc
                      if (dr or dc) and 0 <= nr < H and 0 <= nc < W and grid[nr][nc] != "#":
                          if dr and dc and "#" in (grid[cur[0]][nc], grid[nr][cur[1]]):
                              continue  # no cutting corners
                          ng = g[cur] + (math.sqrt(2) if dr and dc else 1)
                          if ng < g.get((nr, nc), math.inf):
                              g[(nr, nc)], parent[(nr, nc)] = ng, cur
                              heapq.heappush(frontier, (ng + h((nr, nc)), (nr, nc)))
          return None, math.inf, len(closed)

      path, cost, expanded = astar(GRID)
      print(f"cost {cost:.3f}, {len(path)} cells, expanded {expanded}")
      print(path)
  quiz:
  - q: A* is guaranteed to find a shortest path when its heuristic…
    options:
    - never overestimates the remaining cost
    - is computed by BFS
    - always overestimates
    - is exactly zero
    answer: 0
    why: Admissibility means A* can never be lured into finalising the goal via a longer path while a cheaper one is still unexplored.
  - q: Dijkstra's algorithm is the same as A* with…
    options:
    - $g(n) = 0$
    - $h(n) = \infty$
    - $h(n) = 0$
    - a random heuristic
    answer: 2
    why: With no heuristic, $f = g$ and A* expands purely by cost so far, which is exactly Dijkstra.
  - q: Greedy best-first search (only h) is…
    options:
    - often fast, but not guaranteed to find the shortest path
    - always optimal
    - always slower than Dijkstra
    - unable to find any path
    answer: 0
    why: It rushes toward the goal and can commit to a detour around obstacles. Try the Walls map in the interactive.
  deeper:
  - Planning Algorithms (Steven LaValle)
  - PythonRobotics
  - Nav2 documentation
  - Self-Driving Cars (U. Toronto, Coursera)
  build: Run your own A* on the occupancy grid slam_toolbox built in chapter 9, inflate obstacles by the robot radius, and compare your path with Nav2's planner.
- id: arm-motion-planning
  title: 'Motion planning for arms: C-space and RRT'
  short: Arm motion planning
  phase: 3 · Autonomy
  minutes: 30
  summary: An arm plans in configuration space, where it becomes a single point and obstacles become strange blobs. Random trees find paths where grids are hopeless.
  body: |
    Planning for an arm is harder than for a mobile robot: the whole arm must avoid obstacles, not just a point. The trick is to change space. In **configuration space** (C-space) each axis is one joint angle, so a 2-joint arm lives in a 2-D square (really a torus, because angles wrap around) and **the entire arm becomes a single point**. Every configuration where the arm touches an obstacle is painted as forbidden, $\mathcal C_{obs}$. A collision-free motion is now just a curve through the free part, $\mathcal C_{free}$.

    Obstacles in C-space look nothing like the obstacles in the room: one small ball becomes a long curved band, because many different combinations of joint angles hit it. Free space can even split into **disconnected islands**: start and goal in different islands means *no* motion connects them, and a correct planner must fail.

    ### Why sampling

    A 7-joint arm has a 7-D C-space. At 1° resolution that is $360^7 \approx 7.8 \times 10^{17}$ cells: no grid search will ever finish. **Sampling-based planners** never build the grid. They only ask a collision checker "is this configuration free?" and "is this straight segment free?".

    **RRT** (rapidly-exploring random tree) grows a tree from the start: sample a random configuration, find the nearest tree node, step a short distance $\eta$ toward the sample, keep the new node if the step is collision-free. Bias a few samples toward the goal and stop when you reach it. RRT is **probabilistically complete** (if a path exists, the chance of finding it goes to 1 with more samples) but not optimal, so its paths are shortened afterwards by **shortcutting** or replaced by RRT\*.

    ### In practice

    MoveIt 2 uses OMPL (RRTConnect by default) with the FCL collision checker, then **time-parameterises** the path, adding velocities and accelerations that respect joint limits, so the motors can follow it.
  equations:
  - id: free-space
    name: Free configuration space
    tex: \mathcal C_{free}=\mathcal C\setminus\mathcal C_{obs},\qquad \mathcal C_{obs}=\{q:\ \text{robot}(q)\cap\text{obstacles}\ne\varnothing\}
    means: Plan a curve through $\mathcal C_{free}$ and the whole arm is collision-free along it.
  - id: rrt-extend
    name: RRT extend step
    tex: q_{new}=q_{near}+\eta\,\frac{q_{rand}-q_{near}}{\lVert q_{rand}-q_{near}\rVert}
    means: Step a fixed distance $\eta$ from the nearest tree node toward a random sample.
  - id: cspace-size
    name: Why grids fail in high dimensions
    tex: N_{cells}=r^{\,n}\qquad(360^7\approx7.8\times10^{17})
    means: '$r$ cells per joint, $n$ joints: exponential in the number of joints.'
  - id: cubic-time-scaling
    name: Smooth time scaling (rest to rest)
    tex: s(t)=3\Big(\frac tT\Big)^2-2\Big(\frac tT\Big)^3,\qquad q(t)=q_0+s(t)\,(q_1-q_0)
    means: 'Zero velocity at both ends: the simplest way to turn a path segment into a trajectory.'
  interactive:
    name: ArmRRT
    title: C-space and RRT for a 2-link arm
    caption: Drag the red obstacles on the left and watch their C-space shadows change on the right. Tap the C-space to move the start or goal, then **Plan with RRT** and watch the tree grow and the arm follow the shortcut path. Put start and goal in different islands and the planner correctly gives up.
  example:
    title: Free space can split
    body: |
      In the interactive's default scene, the C-space map has **3 disconnected free regions**. We checked this by flood-filling a $120 \times 120$ grid of the C-space (with wrap-around). Of 12 random start/goal pairs, the 4 inside one region were all solved by RRT with collision-free paths, and none of the 8 pairs spanning different regions were "solved". That is exactly the right behaviour: no motion of the real arm connects them without hitting an obstacle.
  code:
    code: |-
      import numpy as np

      rng = np.random.default_rng(3)
      obstacles = [((2.0, 2.0), 0.8), ((3.5, 0.8), 0.6), ((1.0, 3.6), 0.5)]   # circles in a 5 x 5 C-space

      def free(p, q, res=0.02):
          """Collision-check the straight segment p -> q by sampling it."""
          for s in np.linspace(0, 1, max(2, int(np.linalg.norm(q - p) / res))):
              x = p + s * (q - p)
              if any(np.linalg.norm(x - c) < r for c, r in obstacles):
                  return False
          return True

      def rrt(start, goal, step=0.3, iters=3000, goal_bias=0.1):
          nodes, parent = [np.array(start, float)], [-1]
          goal = np.array(goal, float)
          for _ in range(iters):
              q_rand = goal if rng.random() < goal_bias else rng.uniform(0, 5, 2)
              i = int(np.argmin([np.linalg.norm(n - q_rand) for n in nodes]))
              d = q_rand - nodes[i]
              q_new = nodes[i] + d * min(1.0, step / (np.linalg.norm(d) + 1e-12))
              if not free(nodes[i], q_new):
                  continue
              nodes.append(q_new); parent.append(i)
              if np.linalg.norm(q_new - goal) < step and free(q_new, goal):
                  nodes.append(goal); parent.append(len(nodes) - 2)
                  path, k = [], len(nodes) - 1
                  while k >= 0:
                      path.append(nodes[k]); k = parent[k]
                  return path[::-1], len(nodes)
          return None, len(nodes)

      path, n = rrt((0.3, 0.3), (4.6, 4.6))
      length = sum(np.linalg.norm(b - a) for a, b in zip(path, path[1:]))
      print(f"tree nodes {n}, path waypoints {len(path)}, length {length:.2f} (straight line {np.hypot(4.3, 4.3):.2f})")
  quiz:
  - q: In configuration space, the robot arm is…
    options:
    - the same shape as in the workspace
    - a set of line segments
    - a circle
    - a single point
    answer: 3
    why: One point = one set of joint angles = the whole arm's pose. That's why planning there is simple to state.
  - q: RRT is…
    options:
    - a grid search
    - probabilistically complete but not optimal
    - optimal but incomplete
    - complete and optimal
    answer: 1
    why: With enough samples it finds a path if one exists, but the random tree's paths are jagged. RRT* or shortcutting improves them.
  - q: Why don't arm planners discretise C-space into a grid?
    options:
    - Grids can't represent angles
    - Grids are always slower than random sampling in 2-D
    - Collision checking is impossible on grids
    - The number of cells grows exponentially with the number of joints
    answer: 3
    why: '$r^n$ cells: fine for 2 joints, impossible for 7. In 2-D, grids are actually great; the interactive draws one.'
  deeper:
  - MoveIt 2 tutorials
  - OMPL
  - Robotic Manipulation (Russ Tedrake, MIT)
  - Planning Algorithms (Steven LaValle)
  build: In MoveIt 2's Panda demo, plan a pick-and-place around a box, then switch planners (RRTConnect vs RRT*) and compare planning time and path length.
- id: perception
  title: 'Perception: cameras, depth and vision'
  short: Perception basics
  phase: 3 · Autonomy
  minutes: 25
  summary: How a 3-D point becomes a pixel, how two cameras recover depth, and why depth error grows with the square of distance.
  body: |
    ### The pinhole camera

    A camera squashes the 3-D world onto a 2-D sensor. In the camera frame ($x$ right, $y$ down, $z$ forward), a point $(X, Y, Z)$ lands on pixel

    $$u = f_x\frac{X}{Z} + c_x,\qquad v = f_y\frac{Y}{Z} + c_y$$

    $f_x, f_y$ are the focal lengths in pixels and $(c_x, c_y)$ is the image centre. Together they form the **intrinsic matrix** $K$. Where the camera sits on the robot, its **extrinsics** $[R\,|\,t]$, is just a transform from chapter 2. Real lenses also bend straight lines, so you **calibrate**: wave a checkerboard in front of the camera and let OpenCV (or ROS 2's `camera_calibration`) estimate $K$ and the distortion coefficients.

    Dividing by $Z$ throws depth away: a small near object and a big far one can make the same image.

    ### Getting depth back

    - **Stereo:** two cameras a baseline $B$ apart see the same point at slightly different columns. The shift is the **disparity** $d = u_L - u_R = fB/Z$, so $Z = fB/d$. Near things have big disparity; far things have tiny disparity. One pixel of disparity error therefore costs $\Delta Z \approx Z^2\Delta d/(fB)$: **depth error grows with distance squared.**
    - **RGB-D cameras** project a pattern or time light pulses; **lidar** measures time of flight directly and returns a point cloud.

    ### From pixels to things

    Classic pipelines find **features** (corners, ORB) to track between frames; that's what visual SLAM uses. Modern pipelines run neural networks for **detection** (boxes), **segmentation** (pixels), and **6-DoF pose estimation**. Point clouds are cleaned with voxel downsampling, the floor is removed by fitting a plane with RANSAC, and the rest is clustered into objects. Whatever the method, perception's output to the rest of the robot is always a pose in some frame, which takes us straight back to chapter 2.
  equations:
  - id: pinhole-projection
    name: Pinhole projection
    tex: \lambda\begin{bmatrix}u\\v\\1\end{bmatrix}=\underbrace{\begin{bmatrix}f_x&0&c_x\\0&f_y&c_y\\0&0&1\end{bmatrix}}_{K}\begin{bmatrix}X\\Y\\Z\end{bmatrix}
    means: Multiply by the intrinsics and divide by depth ($\lambda = Z$). Depth is lost in the division.
  - id: stereo-depth
    name: Depth from disparity
    tex: d=u_L-u_R=\frac{fB}{Z}\quad\Longleftrightarrow\quad Z=\frac{fB}{d}
    means: Wider baseline $B$ or longer focal length $f$ gives more disparity per metre.
  - id: stereo-depth-error
    name: Depth error from disparity error
    tex: \Delta Z\approx\frac{Z^2}{fB}\,\Delta d
    means: Twice as far means four times the error. Long-range stereo needs wide baselines.
  interactive:
    name: StereoDepth
    title: Stereo depth, live
    caption: 'Drag the point away from the cameras: the disparity shrinks and the amber error band balloons. Widen the baseline to win accuracy back, and toggle whole-pixel rounding to see quantisation error.'
  example:
    title: How good is stereo at 2.5 m and at 10 m?
    body: |
      $f = 700$ px, $B = 12$ cm. A point at $Z = 2.5$ m has disparity $d = 700 \cdot 0.12 / 2.5 = 33.6$ px. One pixel of matching error changes depth by $\Delta Z = 2.5^2/84 = 0.074$ m, about 7 cm.

      At $Z = 10$ m: $d = 8.4$ px and one pixel of error is $10^2/84 = 1.19$ m. Same camera, 16 times worse. That is why cars use lidar or wide-baseline stereo for long range.
  code:
    code: |-
      import numpy as np

      # Pinhole intrinsics: focal lengths and principal point, in pixels
      fx = fy = 700.0
      cx, cy = 320.0, 240.0
      K = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])

      def project(P_cam):
          """3-D point in the camera frame (x right, y down, z forward) -> pixel (u, v)."""
          uvw = K @ P_cam
          return uvw[:2] / uvw[2]

      B = 0.12                                   # stereo baseline (m)
      P = np.array([0.3, 0.1, 2.5])              # point 2.5 m in front of the left camera
      uL = project(P)
      uR = project(P - np.array([B, 0, 0]))      # right camera is B metres to the right
      d = uL[0] - uR[0]
      print(f"disparity {d:.2f} px -> depth Z = f*B/d = {fx * B / d:.3f} m")            # 33.60 px -> 2.500 m
      for Z in (1, 2.5, 5, 10):
          print(f"Z = {Z:4.1f} m: 1 px of disparity error = {Z**2 / (fx * B) * 100:6.1f} cm")
  quiz:
  - q: With a fixed stereo rig, doubling the distance to an object makes the depth error roughly…
    options:
    - 2 times larger
    - the same
    - 4 times larger
    - half as large
    answer: 2
    why: $\Delta Z \propto Z^2$.
  - q: What does the intrinsic matrix $K$ contain?
    options:
    - Focal lengths and the principal point, in pixels
    - The robot's joint angles
    - The camera's position on the robot
    - The lens distortion only
    answer: 0
    why: $K$ is internal to the camera ($f_x, f_y, c_x, c_y$). Where the camera is mounted is the extrinsic transform.
  - q: You need better depth accuracy at 20 m. What helps most?
    options:
    - A higher frame rate
    - A colour camera
    - A wider baseline or longer focal length
    - Moving the cameras closer together
    answer: 2
    why: '$\Delta Z \approx Z^2\Delta d/(fB)$: increase $f$ or $B$ (or measure disparity to sub-pixel precision).'
  deeper:
  - First Principles of Computer Vision (Columbia)
  - Stanford CS231n
  - 'Computer Vision: Algorithms and Applications (Szeliski)'
  - OpenCV tutorials
  build: 'Calibrate your webcam with a printed checkerboard in OpenCV, then estimate the distance to an object of known height $H$ from its pixel height $h$: $Z = f H / h$.'
- id: ros2
  title: 'ROS 2: nodes, topics, services and actions'
  short: ROS 2 architecture
  phase: 4 · Software & learning
  minutes: 30
  summary: The software glue of modern robots. Small programs (nodes) pass typed messages over topics, call services, run long actions, and you inspect all of it from the command line.
  body: |
    A real robot runs dozens of programs at once: camera driver, lidar driver, detector, localizer, planner, motor driver, logger. **ROS 2** (Robot Operating System) is the open-source middleware and tool set that connects them. It is not an operating system; it runs on Linux (also macOS and Windows).

    ### The building blocks

    - **Node:** one process (or part of one) with one job, written in Python (`rclpy`) or C++ (`rclcpp`).
    - **Topic:** a named, typed, many-to-many stream, `/scan` of type `sensor_msgs/msg/LaserScan` or `/cmd_vel` of type `geometry_msgs/msg/Twist`. Publishers don't know who listens. Use topics for continuous data.
    - **Service:** request and response, like a function call across processes (`/get_map`, `/reset`). Use them for quick queries.
    - **Action:** a long-running goal with feedback and cancel (`navigate_to_pose`, `follow_joint_trajectory`). Use them for tasks that take seconds or minutes.
    - **Parameters** configure nodes at runtime, **launch files** (Python) start whole systems, **tf2** tracks frames, **rosbag2** records and replays topics, and **RViz2** visualises everything.

    ### Under the hood

    ROS 2 sits on **DDS**, an industrial publish-subscribe standard, so nodes discover each other automatically on the network: no central master. Each connection has **QoS** settings: *reliable* (re-send lost messages, good for commands and maps) vs *best effort* (drop late data, good for sensor streams where only the newest sample matters), history depth, and durability ("latched" maps that late joiners still receive).

    ### The commands you will type every day

    `ros2 node list`, `ros2 topic list`, `ros2 topic echo /scan`, `ros2 topic hz /scan`, `ros2 service call`, `ros2 launch`, `ros2 bag record`, plus `colcon build` to build your workspace. Install the current LTS distribution and work through the official tutorials linked below in order.
  equations:
  - id: topic-bandwidth
    name: Topic bandwidth
    tex: \text{bandwidth}=\text{bytes per message}\times\text{rate}
    means: Raw 640×480 RGB at 30 Hz is $921{,}600\times30\approx27.6$ MB/s. Know this before streaming over Wi-Fi.
  interactive:
    name: RosGraph
    title: A live ROS 2 graph
    caption: 'Watch messages flow. Kill **/lidar_driver**: half a second later the planner sees stale `/scan` data and stops publishing `/cmd_vel`, so the robot halts (the Hz readouts are 2-second averages, like `ros2 topic hz`). Raise packet loss with best-effort QoS, then switch to reliable. Call the `/get_map` service, then kill `/map_server` and call it again.'
  example:
    title: Can I stream my camera over Wi-Fi?
    body: |
      Raw 640×480 RGB, 3 bytes per pixel: $640 \times 480 \times 3 = 921{,}600$ bytes per image. At 30 Hz that is 27.6 MB/s, or 221 Mbit/s, more than most real-world Wi-Fi delivers and with no room for anything else.

      Options: run the detector **on the robot** and publish only `/detections` (a few hundred bytes); publish `sensor_msgs/CompressedImage` via `image_transport` (JPEG cuts it by roughly 10×); or lower the resolution and rate for remote viewing.
  code:
    title: A complete rclpy node
    code: |-
      import rclpy
      from rclpy.node import Node
      from rclpy.qos import qos_profile_sensor_data
      from sensor_msgs.msg import LaserScan
      from geometry_msgs.msg import Twist


      class SafetyStop(Node):
          """Drive forward; stop when anything is closer than stop_distance in front.
          Assumes a 360-degree scan whose first beam points forward (e.g. TurtleBot3)."""

          def __init__(self):
              super().__init__("safety_stop")
              self.declare_parameter("stop_distance", 0.5)
              self.pub = self.create_publisher(Twist, "cmd_vel", 10)
              # sensor data: best-effort QoS, only the latest scans matter
              self.create_subscription(LaserScan, "scan", self.on_scan, qos_profile_sensor_data)

          def on_scan(self, scan: LaserScan):
              n = len(scan.ranges)
              cone = list(scan.ranges[: n // 12]) + list(scan.ranges[-(n // 12):])   # +-30 degrees
              valid = [r for r in cone if scan.range_min < r < scan.range_max]
              stop = self.get_parameter("stop_distance").value
              cmd = Twist()
              cmd.linear.x = 0.0 if valid and min(valid) < stop else 0.2
              self.pub.publish(cmd)


      def main():
          rclpy.init()
          node = SafetyStop()
          try:
              rclpy.spin(node)
          finally:
              node.destroy_node()
              rclpy.shutdown()


      if __name__ == "__main__":
          main()

      # Run:  python3 safety_stop.py --ros-args -p stop_distance:=0.4
      # Watch: ros2 topic hz /cmd_vel    ros2 topic echo /cmd_vel
  quiz:
  - q: You want 'drive to the kitchen', with progress updates and the option to cancel. Which ROS 2 mechanism fits?
    options:
    - A topic
    - An action
    - A service
    - A parameter
    answer: 1
    why: Actions are for long-running goals with feedback and cancel; Nav2's navigate_to_pose is one.
  - q: A camera stream crosses a lossy Wi-Fi link. Which QoS reliability is usually right?
    options:
    - Transient local
    - 'Reliable: every frame must arrive'
    - It doesn't matter
    - 'Best effort: only the newest frames matter'
    answer: 3
    why: Re-sending a stale frame just delays newer ones. Sensor streams typically use the sensor-data (best-effort) profile.
  - q: Which command shows how often messages arrive on /scan?
    options:
    - ros2 topic echo /scan
    - ros2 topic hz /scan
    - ros2 bag play /scan
    - ros2 node info /scan
    answer: 1
    why: '`hz` measures the publish rate; `echo` prints the messages themselves.'
  deeper:
  - ROS 2 official tutorials
  - 'ETH Zurich: Programming for Robotics – ROS'
  - Articulated Robotics
  - Nav2 documentation
  build: 'Write a two-node package: one publishes a fake range sensor at 20 Hz, the other filters it and publishes /cmd_vel. Start both from one Python launch file, record a rosbag2, and replay it.'
- id: simulation
  title: 'Simulation: physics engines and the sim-to-real gap'
  short: Simulation
  phase: 4 · Software & learning
  minutes: 25
  summary: Simulators integrate the equations of motion step by step. The integrator and time step decide whether your simulated robot behaves, or quietly gains energy and explodes.
  body: |
    Everything in chapters 5 to 7 assumed we could solve the equations of motion. A **physics engine** does it numerically: every few milliseconds it computes forces, detects collisions, solves for contact forces, and advances positions and velocities by one time step $\Delta t$. Add sensor models (cameras, lidar with noise) and you can develop, test and even train robots without touching hardware.

    ### The time step matters

    The simplest integrator, **explicit Euler**, updates position and velocity both from the *old* values. On a frictionless spring it adds a little energy every single step, a factor of exactly $1 + \omega^2\Delta t^2$, so oscillations grow until the simulation explodes. **Semi-implicit (symplectic) Euler** updates velocity first and uses the *new* velocity for position. It's just as cheap but keeps energy bounded, which is why most game and robotics engines use it or a close relative. **RK4** is very accurate per step but costs four force evaluations. Stiff contacts need small steps; robotics simulators typically run physics at hundreds of Hz to 1 kHz.

    ### Which simulator?

    - **Gazebo**: the standard for ROS 2; sensors, plugins, worlds.
    - **MuJoCo**: fast, accurate contact; the go-to for control and RL research; models in MJCF XML.
    - **NVIDIA Isaac Sim / Isaac Lab**: GPU-accelerated, photorealistic rendering, thousands of robots in parallel for learning; scenes in USD.
    - **Webots**, **PyBullet**, **Drake**: also free and widely used.

    Robots are described in **URDF** (ROS), **MJCF** (MuJoCo) or **USD** (Isaac), and converters exist between them.

    ### The sim-to-real gap

    Simulated friction, motor torque curves, latency, sensor noise and cable drag are never quite right, so a controller that's perfect in sim can fail on hardware. Two standard remedies: **system identification** (measure the real parameters and put them in the model) and **domain randomisation** (train or test across random masses, frictions, delays and lighting so the real world is just one more variation).
  equations:
  - id: explicit-euler
    name: Explicit Euler
    tex: x_{k+1}=x_k+\Delta t\,v_k,\qquad v_{k+1}=v_k+\Delta t\,a(x_k)
    means: Both updates use old values. Simple, and it injects energy into oscillators.
  - id: symplectic-euler
    name: Semi-implicit (symplectic) Euler
    tex: v_{k+1}=v_k+\Delta t\,a(x_k),\qquad x_{k+1}=x_k+\Delta t\,v_{k+1}
    means: Use the new velocity for the position. Same cost, bounded energy error.
  - id: euler-energy-growth
    name: Explicit Euler on a spring
    tex: \frac{E_{k+1}}{E_k}=1+\omega^2\Delta t^2
    means: 'Exact for $\ddot x=-\omega^2x$: energy grows geometrically every step, however small $\Delta t$ is.'
  interactive:
    name: Integrators
    title: Same spring, three integrators
    caption: At $\Delta t = 20$ ms explicit Euler's energy is already climbing; push the step toward 100 ms and it explodes while symplectic Euler and RK4 hold on. Shrink $\Delta t$ and all three converge to the exact cosine.
  example:
    title: How fast does explicit Euler blow up?
    body: |
      A 1 Hz spring ($\omega = 2\pi$) simulated at $\Delta t = 10$ ms (100 Hz). Each step multiplies the energy by $1 + (2\pi \cdot 0.01)^2 = 1.00395$. After 10 s, that is 1000 steps:

      $$1.00395^{1000} = e^{1000 \ln 1.00395} \approx 51.4$$

      The "frictionless" spring now has 51 times its starting energy. The interactive's readout shows the same 51.4× at 10 ms, while symplectic Euler stays within a few percent and RK4 within 0.0001 %.
  code:
    title: A pendulum in MuJoCo (pip install mujoco)
    code: |-
      import mujoco
      import numpy as np

      # A 1 m pendulum in MJCF (MuJoCo's XML format): a point mass on a massless rod
      XML = """
      <mujoco>
        <option timestep="0.001" integrator="RK4"/>
        <worldbody>
          <body pos="0 0 2">
            <joint name="hinge" type="hinge" axis="0 1 0"/>
            <geom type="capsule" fromto="0 0 0 0 0 -1" size="0.01" mass="0"/>
            <geom type="sphere" pos="0 0 -1" size="0.05" mass="1"/>
          </body>
        </worldbody>
      </mujoco>
      """
      model = mujoco.MjModel.from_xml_string(XML)
      data = mujoco.MjData(model)
      data.qpos[0] = np.radians(10)

      angles, times = [], []
      while data.time < 10:
          mujoco.mj_step(model, data)
          angles.append(data.qpos[0]); times.append(data.time)

      a, t = np.array(angles), np.array(times)
      up = np.where((a[:-1] < 0) & (a[1:] >= 0))[0]
      print(f"MuJoCo period {np.mean(np.diff(t[up])):.3f} s vs 2*pi*sqrt(L/g) = {2 * np.pi * np.sqrt(1 / 9.81):.3f} s")
  quiz:
  - q: Explicit Euler simulating an undamped spring makes the energy…
    options:
    - grow every step
    - decay to zero
    - oscillate around the true value
    - stay exactly constant
    answer: 0
    why: Each step multiplies energy by $1+\omega^2\Delta t^2 > 1$. Symplectic Euler keeps it bounded instead.
  - q: Domain randomisation means…
    options:
    - randomising the robot's goal
    - randomly choosing which simulator to use
    - training or testing across randomised physics and visuals so the real world looks like one more variation
    - adding random bugs to find crashes
    answer: 2
    why: If a policy works for masses from 0.8 to 1.2 kg and frictions from 0.5 to 1.0, the real values are probably in there.
  - q: Why are GPU simulators like Isaac Lab or MuJoCo Playground popular for robot learning?
    options:
    - They run thousands of environments in parallel, so RL gets years of experience in hours
    - They guarantee sim-to-real transfer
    - They don't need a robot model
    - They are the only simulators with gravity
    answer: 0
    why: RL is sample-hungry. Parallel simulation is what made learned locomotion practical. Transfer still needs randomisation and testing.
  deeper:
  - Gazebo tutorials
  - MuJoCo documentation
  - Isaac Lab
  - NVIDIA Physical AI Learning
  - Webots tutorials
  build: Describe your robot in URDF, drive it in Gazebo through ROS 2, then load the same model into MuJoCo and compare the motion for the same wheel commands.
- id: robot-learning
  title: 'Robot learning: RL, imitation and VLA models'
  short: Robot learning
  phase: 4 · Software & learning
  minutes: 35
  summary: 'When a task is too messy to model, learn it: from reward (reinforcement learning), from demonstrations (imitation learning), or by fine-tuning a vision-language-action foundation model.'
  body: |
    Folding laundry, opening unfamiliar doors, walking on gravel: some tasks are too messy to write equations for. Robot learning replaces hand-written models with data.

    ### Reinforcement learning

    An **MDP** has states $s$, actions $a$, rewards $r$ and a discount $\gamma < 1$. The goal is a policy that maximises the expected **return** $G = \sum_k \gamma^k r_k$. The **action value** $Q(s, a)$ is the return you expect after doing $a$ in $s$ and acting well afterwards. **Q-learning** learns it from experience with one update per step: nudge $Q(s,a)$ toward $r + \gamma\max_{a'}Q(s',a')$. Explore with probability $\varepsilon$, otherwise act greedily.

    Real robots have continuous states and actions, so deep RL (PPO, SAC) uses neural networks and needs millions of steps. In practice that means training in parallel GPU simulation and transferring to hardware with domain randomisation. Designing the reward is half the work: a policy will exploit any loophole you leave (**reward hacking**).

    ### Imitation learning

    Often it is easier to *show* than to reward. Teleoperate the robot (for example a leader arm puppeteering a follower, as in Hugging Face's LeRobot with the SO-101), record observation–action pairs, and train a network to copy them: **behaviour cloning**. Its classic failure is **compounding error**: a small mistake leads to states the demonstrations never covered, where the policy makes bigger mistakes. Remedies: more diverse demos, DAgger-style corrections, and architectures that predict whole **action chunks** (ACT) or sample them with diffusion (**Diffusion Policy**).

    ### Vision-language-action models

    A **VLA** starts from a vision-language model and trains it to output robot actions: images plus an instruction ("put the red cup in the sink") in, motor commands out. They are pretrained on pooled data from many robots; the **Open X-Embodiment** dataset has 1M+ real trajectories from 22 robot types. **OpenVLA** is a 7B-parameter open model trained on 970k of those episodes. Physical Intelligence's **π0** family (openpi), **Octo** and NVIDIA's **GR00T** for humanoids are open too. The workflow: collect a few dozen demos of your task, fine-tune, evaluate on many trials.
  equations:
  - id: discounted-return
    name: Discounted return
    tex: G_t=\sum_{k=0}^{\infty}\gamma^k\,r_{t+k+1},\qquad 0\le\gamma<1
    means: Rewards now count more than rewards later. With $\gamma=0.95$, a reward 10 steps away is worth $0.95^{10}\approx0.60$.
  - id: bellman-optimality
    name: Bellman optimality
    tex: Q^*(s,a)=\mathbb E\big[r+\gamma\max_{a'}Q^*(s',a')\big]
    means: The value of an action is its reward plus the discounted value of acting optimally afterwards.
  - id: q-learning-update
    name: Q-learning update
    tex: Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\max_{a'}Q(s',a')-Q(s,a)\big]
    means: Move the estimate a fraction $\alpha$ toward the one-step target. Converges to $Q^*$ with enough exploration.
  - id: behaviour-cloning
    name: Behaviour cloning
    tex: \min_\theta\ \sum_i\big\lVert\pi_\theta(o_i)-a_i\big\rVert^2
    means: Plain supervised learning on demonstration pairs (observation $o_i$, action $a_i$).
  interactive:
    name: GridworldRL
    title: Q-learning, live
    caption: 'Press **Train live**. Values spread backward from the +1 like ink, and the arrows become a policy. Compare with **Show optimal values** (value iteration): on the deterministic floor Q-learning converges to the same numbers. Then make the floor slippery and watch the policy keep away from the pit.'
  example:
    title: One Q-learning update by hand
    body: |
      The robot is in a cell with $Q(s, \text{right}) = 0$, moves right, pays the step cost $r = -0.04$, and lands in a cell whose best action is worth $\max_{a'}Q(s', a') = 0.8$. With $\alpha = 0.5$ and $\gamma = 0.95$:

      $$Q(s,\text{right}) \leftarrow 0 + 0.5\,\big[-0.04 + 0.95\cdot 0.8 - 0\big] = 0.5 \cdot 0.72 = 0.36$$

      Repeat that millions of times and value propagates from the goal back to the start. In our checks on the interactive's grid world (no slip, $\gamma = 0.95$), Q-learning's values along its greedy path match value iteration to within $10^{-15}$, and its path length equals the optimal one.
  code:
    title: Tabular Q-learning from scratch
    code: |-
      import numpy as np

      rng = np.random.default_rng(0)
      # 4 x 4 grid world: start bottom-left (12), goal top-right (3, +1), pit (7, -1), wall (5)
      W, H, START, GOAL, PIT, WALLS = 4, 4, 12, 3, 7, {5}
      ACTIONS = [(0, -1), (1, 0), (0, 1), (-1, 0)]   # up, right, down, left

      def step(s, a):
          x, y = s % W + ACTIONS[a][0], s // W + ACTIONS[a][1]
          s2 = s if not (0 <= x < W and 0 <= y < H) or y * W + x in WALLS else y * W + x
          r = 1.0 if s2 == GOAL else -1.0 if s2 == PIT else -0.04
          return s2, r, s2 in (GOAL, PIT)

      Q = np.zeros((W * H, 4))
      alpha, gamma, eps = 0.5, 0.95, 0.2
      for episode in range(2000):
          s, done = START, False
          while not done:
              a = rng.integers(4) if rng.random() < eps else int(np.argmax(Q[s]))
              s2, r, done = step(s, a)
              target = r + (0 if done else gamma * Q[s2].max())
              Q[s, a] += alpha * (target - Q[s, a])     # the Q-learning update
              s = s2

      arrows = "^>v<"
      for y in range(H):
          print(" ".join("G" if (c := y * W + x) == GOAL else "P" if c == PIT else "#" if c in WALLS else arrows[int(np.argmax(Q[c]))] for x in range(W)))
      print("V(start) =", round(Q[START].max(), 3))
  quiz:
  - q: In $\varepsilon$-greedy, $\varepsilon$ controls…
    options:
    - the size of the grid
    - the discount on future rewards
    - the learning rate
    - how often the agent explores a random action
    answer: 3
    why: With probability $\varepsilon$ take a random action, otherwise the best known one. No exploration, no learning about alternatives.
  - q: Behaviour cloning's classic failure mode is…
    options:
    - it can't use images
    - 'compounding errors: small mistakes lead to unfamiliar states and bigger mistakes'
    - it needs a reward function
    - it always overfits to the simulator
    answer: 1
    why: The policy only saw states the expert visited. Once it drifts off that distribution it has no idea how to recover.
  - q: A vision-language-action (VLA) model maps…
    options:
    - joint angles to end-effector pose
    - actions to images
    - text to text
    - camera images and a language instruction to robot actions
    answer: 3
    why: It reuses a pretrained vision-language backbone and adds an action output, trained on large multi-robot datasets like Open X-Embodiment.
  deeper:
  - Hugging Face Robotics Course
  - LeRobot
  - Hugging Face Deep RL Course
  - UC Berkeley CS285 Deep Reinforcement Learning
  - OpenVLA
  - openpi (π0 / π0.5)
  - Diffusion Policy
  build: Record 50 teleoperated demonstrations of a pick-and-place with an SO-101 arm and LeRobot, train an ACT or diffusion policy, and report its success rate over 20 trials.
- id: humanoids-legged
  title: Humanoids and legged locomotion
  short: Humanoids & legged
  phase: 4 · Software & learning
  minutes: 30
  summary: A walking robot is always falling and catching itself. The linear inverted pendulum and its capture point explain where to step, and RL in simulation now learns the rest.
  body: |
    Wheels never leave the ground; legs do. Legged robots are **underactuated** (nothing bolts the body to the floor) and **hybrid** (contacts switch on and off), which is why they look so different from the arms in earlier chapters.

    ### Balance

    A standing robot is balanced while the point where the ground pushes back, the **centre of pressure** (or **ZMP**, zero-moment point), stays inside the **support polygon** under its feet. Walking slowly enough to always keep the centre of mass over the feet is *static* walking. Humans and fast robots walk *dynamically*: they deliberately fall forward and catch themselves with the next step.

    ### The linear inverted pendulum

    Model the robot as a point mass at constant height $z_0$ balanced on a massless leg at foot position $p$. Then

    $$\ddot x = \omega^2 (x - p),\qquad \omega = \sqrt{g/z_0}$$

    It is unstable: the mass accelerates *away* from the foot, exponentially. But it is linear, so it has a closed-form solution, and one quantity tells you everything: the **capture point** $\xi = x + \dot x/\omega$. Put the foot exactly on $\xi$ and the robot comes to rest over it. Step short and it keeps falling forward; step long and it falls back. Walking is choosing each footstep relative to the capture point; modern controllers regulate it directly (divergent component of motion control).

    ### How today's humanoids are built

    - **Model-based:** MPC plans contact forces and footsteps over the next second on a simplified model (LIPM, centroidal dynamics); a **whole-body controller** solves a quadratic program at about 1 kHz for joint torques that realise them.
    - **Learned:** a neural policy maps joint states and IMU readings to joint targets, trained with RL across thousands of parallel simulated robots (legged_gym, Isaac Lab, MuJoCo Playground) with heavy domain randomisation, then deployed zero-shot. Most recent quadruped and humanoid demos use this, often combined with the model-based ideas above.
    - **Foundation models** such as NVIDIA's GR00T aim to give humanoids general manipulation skills on top.
  equations:
  - id: lipm
    name: Linear inverted pendulum
    tex: \ddot x=\omega^2\,(x-p),\qquad \omega=\sqrt{g/z_0}
    means: Centre of mass $x$ at constant height $z_0$, foot at $p$. Taller robots fall more slowly.
  - id: lipm-solution
    name: Closed-form motion
    tex: x(t)=p+(x_0-p)\cosh\omega t+\frac{\dot x_0}{\omega}\sinh\omega t
    means: Exponential divergence from the foot unless the initial conditions are just right.
  - id: capture-point
    name: Capture point
    tex: \xi=x+\frac{\dot x}{\omega}
    means: Step here and the robot comes to rest over its foot. It moves as $\dot\xi=\omega(\xi-p)$, away from the foot.
  - id: zmp
    name: Zero-moment point (LIPM)
    tex: p_{zmp}=x-\frac{z_0}{g}\,\ddot x
    means: Where the ground reaction must act to produce acceleration $\ddot x$. It must stay inside the support polygon.
  interactive:
    name: LipmWalker
    title: Push it, then choose where to step
    caption: 'Push the robot to 0.6 m/s and step at the wrong place: it falls. Press **Step on the capture point** and it stops dead. Switch to **Walk** and set the step offset $b$: $b = 0$ stops after one step, and larger $b$ gives a steady gait.'
  example:
    title: How big a step after a shove?
    body: |
      Centre of mass at $z_0 = 0.9$ m: $\omega = \sqrt{9.81/0.9} = 3.30$ s⁻¹. A shove gives it $\dot x = 0.6$ m/s while it stands over its foot at $x = 0$:

      $$\xi = 0 + \frac{0.6}{3.30} = 0.182\text{ m}$$

      An 18 cm step catches it. Step 5 cm short and one second later the centre of mass is 0.67 m past the foot and still accelerating: it falls. The code below checks all three cases with the closed-form solution.
  code:
    code: |-
      import numpy as np

      g, z0 = 9.81, 0.9                 # gravity, centre-of-mass height (m)
      w = np.sqrt(g / z0)               # LIPM natural frequency, 1/s

      def lipm(x0, v0, p, t):
          """Closed-form LIPM: x'' = w^2 (x - p) with the foot (pivot) at p."""
          x = p + (x0 - p) * np.cosh(w * t) + v0 / w * np.sinh(w * t)
          v = (x0 - p) * w * np.sinh(w * t) + v0 * np.cosh(w * t)
          return x, v

      v_push = 0.6                      # someone shoves the robot to 0.6 m/s
      xi = 0.0 + v_push / w             # capture point
      print(f"omega = {w:.2f} 1/s, capture point = {xi:.3f} m ahead")   # 3.30 1/s, 0.182 m

      for foot in (xi - 0.05, xi, xi + 0.05):
          x, v = lipm(0.0, v_push, foot, t=1.0)
          verdict = "falls forward" if v > 0.05 else "falls backward" if v < -0.05 else "stops over the foot"
          print(f"step at {foot:.3f} m -> after 1 s COM is {x - foot:+.2f} m from the foot, v = {v:+.2f} m/s: {verdict}")
  quiz:
  - q: A taller robot (larger $z_0$) receives the same shove. Its capture point is…
    options:
    - the same
    - closer
    - further away, so it must step further
    - behind it
    answer: 2
    why: $\omega = \sqrt{g/z_0}$ is smaller, so $\xi = x + \dot x/\omega$ is larger.
  - q: If the foot is placed exactly on the capture point, the LIPM…
    options:
    - comes to rest balanced over the foot
    - falls forward
    - falls backward
    - oscillates forever
    answer: 0
    why: With $x_0 - p = -\dot x_0/\omega$ the growing exponential cancels and $x - p$ decays like $e^{-\omega t}$.
  - q: Why do learned locomotion policies rely on domain randomisation?
    options:
    - Because the simulator has no gravity
    - To avoid needing an IMU
    - So the policy is robust to mismatched mass, friction and latency on the real robot
    - To make training faster on a CPU
    answer: 2
    why: The real robot never matches the simulator exactly. Training across a spread of physics makes the real one fall inside the training distribution.
  deeper:
  - 'PennX: Robotics: Locomotion Engineering'
  - Underactuated Robotics (Russ Tedrake, MIT)
  - legged_gym
  - MuJoCo Playground
  - NVIDIA Isaac GR00T
  - HumanoidBench
  build: Train a quadruped or humanoid to walk in Isaac Lab or MuJoCo Playground, then randomise friction and mass and find which policy still walks.
resources:
- name: MIT 18.06 Linear Algebra (Gilbert Strang)
  url: https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/
  category: Math
  badge: free course · MIT OCW
  description: 'Strang''s full lecture course: matrices, eigenvalues, least squares. The math under every robot transform.'
  tags:
  - course
  - video
  - MIT
- name: '3Blue1Brown: Essence of linear algebra'
  url: https://www.3blue1brown.com/topics/linear-algebra
  category: Math
  badge: video series
  description: Visual intuition for vectors, matrices, determinants and eigenvectors.
  tags:
  - video
- name: 'Khan Academy: Linear algebra'
  url: https://www.khanacademy.org/math/linear-algebra
  category: Math
  badge: free course
  description: Self-paced lessons and exercises from zero.
  tags:
  - course
- name: MIT 18.01SC Single Variable Calculus
  url: https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/
  category: Math
  badge: free course · MIT OCW
  description: Derivatives and integrals with lecture videos and problem sets.
  tags:
  - course
  - video
  - MIT
- name: MIT 18.02SC Multivariable Calculus
  url: https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/
  category: Math
  badge: free course · MIT OCW
  description: Vectors, partial derivatives and gradients, used in Jacobians and optimization.
  tags:
  - course
  - video
  - MIT
- name: MIT 18.03SC Differential Equations
  url: https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/
  category: Math
  badge: free course · MIT OCW
  description: 'ODEs and linear systems: the language of dynamics and control.'
  tags:
  - course
  - video
  - MIT
- name: MIT 6.041SC Probabilistic Systems Analysis
  url: https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/
  category: Math
  badge: free course · MIT OCW
  description: Probability and random variables, the basis of filters and SLAM.
  tags:
  - course
  - video
  - MIT
- name: CS50's Introduction to Programming with Python
  url: https://cs50.harvard.edu/python/
  category: Programming
  badge: free course · Harvard
  description: Harvard's free Python course with lectures and problem sets.
  tags:
  - course
  - video
  - Python
- name: MIT 6.100L Intro to CS and Programming in Python
  url: https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/
  category: Programming
  badge: free course · MIT OCW
  description: MIT's intro programming course, recorded in 2022.
  tags:
  - course
  - video
  - MIT
  - Python
- name: LearnCpp.com
  url: https://www.learncpp.com/
  category: Programming
  badge: free tutorial
  description: Complete free C++ tutorial, the language of ROS 2 drivers and controllers.
  tags:
  - C++
- name: The Missing Semester (MIT)
  url: https://missing.csail.mit.edu/
  category: Programming
  badge: free course · MIT
  description: Shell, editors, Git, debugging and build tools.
  tags:
  - course
  - Linux
- name: Modern Robotics (Northwestern, Coursera)
  url: https://www.coursera.org/specializations/modernrobotics
  category: Kinematics & dynamics
  badge: free to audit · Coursera
  description: 'Kevin Lynch''s 6-course specialization: configuration space, rigid-body motion, kinematics, dynamics, planning, control.'
  tags:
  - course
  - video
  - audit
- name: Modern Robotics book and videos
  url: https://hades.mech.northwestern.edu/index.php/Modern_Robotics
  category: Kinematics & dynamics
  badge: free book · Northwestern
  description: Free PDF of Lynch & Park's textbook plus all lecture videos and software.
  tags:
  - book
  - video
- name: Stanford CS223A Introduction to Robotics
  url: https://see.stanford.edu/Course/CS223A
  category: Kinematics & dynamics
  badge: free course · Stanford
  description: 'Oussama Khatib''s classic course: kinematics, Jacobians, dynamics and control.'
  tags:
  - course
  - video
  - Stanford
- name: CS223A lecture playlist
  url: https://www.youtube.com/playlist?list=PL65CC0384A1798ADF
  category: Kinematics & dynamics
  badge: YouTube · Stanford
  description: Stanford's full Introduction to Robotics lecture collection on YouTube.
  tags:
  - video
  - Stanford
- name: QUT Robot Academy
  url: https://robotacademy.net.au/
  category: Kinematics & dynamics
  badge: free lessons · QUT
  description: Peter Corke's short video lessons and masterclasses on robot arms, mobile robots and vision.
  tags:
  - course
  - video
- name: 'PennX: Robotics: Kinematics and Mathematical Foundations'
  url: https://www.edx.org/learn/robotics/university-of-pennsylvania-robotics-kinematics-and-mathematical-foundations
  category: Kinematics & dynamics
  badge: free to audit · edX
  description: Penn's graduate-level kinematics course from the Robotics MicroMasters.
  tags:
  - course
  - audit
- name: ETH Zurich Robot Dynamics
  url: https://rsl.ethz.ch/education-students/lectures/robotdynamics.html
  category: Kinematics & dynamics
  badge: course page · ETH Zurich
  description: ETH's master's course on kinematics and dynamics of arms, legged robots and drones, with slides and exercises.
  tags:
  - course
  - ETH
- name: MIT 2.003SC Engineering Dynamics
  url: https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/
  category: Kinematics & dynamics
  badge: free course · MIT OCW
  description: Newtonian and Lagrangian dynamics with lecture videos.
  tags:
  - course
  - video
  - MIT
- name: Control Bootcamp (Steve Brunton)
  url: https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m
  category: Control
  badge: YouTube · U. Washington
  description: Short lectures on state space, controllability, LQR and Kalman filters, with code.
  tags:
  - video
- name: 'Brian Douglas: control lectures'
  url: https://www.youtube.com/@BrianBDouglas
  category: Control
  badge: YouTube
  description: Clear, intuitive videos on PID, root locus, frequency response and state space.
  tags:
  - video
- name: MIT 6.302 Feedback Systems
  url: https://ocw.mit.edu/courses/6-302-feedback-systems-spring-2007/
  category: Control
  badge: free course · MIT OCW
  description: 'Classical feedback control: stability, compensation, frequency methods.'
  tags:
  - course
  - MIT
- name: Feedback Systems (Åström & Murray)
  url: https://fbswiki.org/
  category: Control
  badge: free book
  description: Free textbook on feedback control for scientists and engineers.
  tags:
  - book
- name: 'Model Predictive Control: Theory, Computation, and Design'
  url: https://sites.engineering.ucsb.edu/~jbraw/mpc/
  category: Control
  badge: free book · UCSB
  description: Rawlings, Mayne & Diehl's MPC textbook, free to download.
  tags:
  - book
- name: 'PennX: Robotics: Dynamics and Control'
  url: https://www.edx.org/learn/robotics/university-of-pennsylvania-robotics-dynamics-and-control
  category: Control
  badge: free to audit · edX
  description: Dynamics and control of robot arms and mobile robots.
  tags:
  - course
  - audit
- name: MIT 6.002 Circuits and Electronics
  url: https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/
  category: Electronics & embedded
  badge: free course · MIT OCW
  description: Anant Agarwal's circuits course with lecture videos.
  tags:
  - course
  - video
  - MIT
- name: 'UTAustinX: Embedded Systems – Shape the World'
  url: https://www.edx.org/learn/embedded-systems/the-university-of-texas-at-austin-embedded-systems-shape-the-world-microcontroller-input-output
  category: Electronics & embedded
  badge: free to audit · edX
  description: 'Hands-on microcontroller programming in C: I/O, interrupts, timers.'
  tags:
  - course
  - audit
  - C++
- name: 'Arduino documentation: Learn'
  url: https://docs.arduino.cc/learn/
  category: Electronics & embedded
  badge: official tutorials
  description: Arduino's own tutorials on electronics, sensors, motors and communication.
  tags:
  - docs
  - Arduino
- name: Raspberry Pi projects
  url: https://projects.raspberrypi.org/en
  category: Electronics & embedded
  badge: free projects
  description: Step-by-step electronics and coding projects from the Raspberry Pi Foundation.
  tags:
  - projects
- name: All About Circuits textbook
  url: https://www.allaboutcircuits.com/textbook/
  category: Electronics & embedded
  badge: free book
  description: 'Free online electronics textbook: DC, AC, semiconductors, digital.'
  tags:
  - book
- name: ROS 2 official tutorials
  url: https://docs.ros.org/en/jazzy/Tutorials.html
  category: ROS 2
  badge: official docs
  description: From CLI basics to writing nodes in Python and C++, TF2 and URDF.
  tags:
  - docs
  - ROS 2
- name: ROS 2 documentation
  url: https://docs.ros.org/en/rolling/
  category: ROS 2
  badge: official docs
  description: Concepts, how-to guides and the full API reference.
  tags:
  - docs
  - ROS 2
- name: 'ETH Zurich: Programming for Robotics – ROS'
  url: https://rsl.ethz.ch/education-students/lectures/ros.html
  category: ROS 2
  badge: course · ETH Zurich
  description: ETH's ROS course with slides, exercises and recorded lectures.
  tags:
  - course
  - ETH
  - ROS 2
- name: Articulated Robotics
  url: https://articulatedrobotics.xyz/
  category: ROS 2
  badge: free tutorials
  description: Build a real ROS 2 mobile robot step by step, with matching videos.
  tags:
  - ROS 2
  - projects
- name: Articulated Robotics on YouTube
  url: https://www.youtube.com/@ArticulatedRobotics
  category: ROS 2
  badge: YouTube
  description: Video series on ROS 2, URDF, Gazebo, SLAM and Nav2 with a real robot.
  tags:
  - video
  - ROS 2
- name: Nav2 documentation
  url: https://docs.nav2.org/
  category: ROS 2
  badge: official docs
  description: 'The ROS 2 navigation stack: maps, planners, controllers, behavior trees, with tutorials.'
  tags:
  - docs
  - ROS 2
- name: MoveIt 2 tutorials
  url: https://moveit.picknik.ai/main/index.html
  category: ROS 2
  badge: official docs
  description: Motion planning for robot arms in ROS 2, from first plan to pick-and-place.
  tags:
  - docs
  - ROS 2
- name: Gazebo tutorials
  url: https://gazebosim.org/docs/latest/tutorials/
  category: Simulation
  badge: official docs
  description: The standard open-source simulator for ROS 2 robots.
  tags:
  - docs
  - sim
- name: NVIDIA Isaac Sim docs
  url: https://docs.isaacsim.omniverse.nvidia.com/latest/index.html
  category: Simulation
  badge: official docs
  description: Photorealistic, GPU-accelerated simulation with ROS 2 support and tutorials.
  tags:
  - docs
  - sim
  - NVIDIA
- name: Isaac Lab
  url: https://isaac-sim.github.io/IsaacLab/main/index.html
  category: Simulation
  badge: official docs
  description: 'NVIDIA''s open framework for robot learning on Isaac Sim: RL, imitation, sim-to-real.'
  tags:
  - docs
  - sim
  - NVIDIA
- name: MuJoCo documentation
  url: https://mujoco.readthedocs.io/
  category: Simulation
  badge: official docs
  description: Google DeepMind's fast physics engine for robotics and RL.
  tags:
  - docs
  - sim
- name: MuJoCo Menagerie
  url: https://github.com/google-deepmind/mujoco_menagerie
  category: Simulation
  badge: GitHub · DeepMind
  description: Ready-to-use, high-quality models of real robots for MuJoCo.
  tags:
  - GitHub
  - sim
- name: Webots tutorials
  url: https://cyberbotics.com/doc/guide/tutorials
  category: Simulation
  badge: official docs
  description: Open-source simulator with beginner tutorials for wheeled and legged robots.
  tags:
  - docs
  - sim
- name: PyBullet
  url: https://pybullet.org/
  category: Simulation
  badge: official site
  description: Python physics simulation used in many robotics and RL papers.
  tags:
  - sim
  - Python
- name: NVIDIA Physical AI Learning
  url: https://docs.nvidia.com/learning/physical-ai/
  category: Simulation
  badge: free learning path · NVIDIA
  description: 'NVIDIA''s free robotics learning content: Isaac Sim, Isaac ROS, Isaac Lab, GR00T and sim-to-real with SO-101.'
  tags:
  - course
  - NVIDIA
- name: First Principles of Computer Vision (Columbia)
  url: https://fpcv.cs.columbia.edu/
  category: Perception & vision
  badge: free lectures · Columbia
  description: Shree Nayar's lecture series for people with no prior computer-vision background.
  tags:
  - course
  - video
- name: Stanford CS231n
  url: https://cs231n.stanford.edu/
  category: Perception & vision
  badge: course · Stanford
  description: 'Deep learning for computer vision: CNNs, detection, segmentation. Notes and lectures online.'
  tags:
  - course
  - Stanford
- name: 'Computer Vision: Algorithms and Applications (Szeliski)'
  url: https://szeliski.org/Book/
  category: Perception & vision
  badge: free book
  description: Richard Szeliski's textbook, 2nd edition, free PDF.
  tags:
  - book
- name: OpenCV tutorials
  url: https://docs.opencv.org/4.x/d9/df8/tutorial_root.html
  category: Perception & vision
  badge: official docs
  description: Camera calibration, features, stereo and object detection with OpenCV.
  tags:
  - docs
- name: 'PennX: Robotics: Vision Intelligence and Machine Learning'
  url: https://www.edx.org/learn/robotics/university-of-pennsylvania-robotics-vision-intelligence-and-machine-learning
  category: Perception & vision
  badge: free to audit · edX
  description: Penn's course on vision and learning for robots.
  tags:
  - course
  - audit
- name: Robot Mapping (Cyrill Stachniss)
  url: https://www.ipb.uni-bonn.de/robot-mapping/
  category: SLAM & state estimation
  badge: free course · Uni Bonn
  description: 'Full SLAM course: EKF, particle filters, graph-based SLAM, with slides and videos.'
  tags:
  - course
  - video
- name: Cyrill Stachniss on YouTube
  url: https://www.youtube.com/@CyrillStachniss
  category: SLAM & state estimation
  badge: YouTube
  description: Hundreds of lectures on SLAM, photogrammetry and robot perception.
  tags:
  - video
- name: State Estimation for Robotics (Barfoot)
  url: https://asrl.utias.utoronto.ca/~tdb/bib/barfoot_ser24.pdf
  category: SLAM & state estimation
  badge: free book · U. Toronto
  description: Tim Barfoot's textbook, free PDF of the second edition.
  tags:
  - book
- name: Kalman and Bayesian Filters in Python
  url: https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python
  category: SLAM & state estimation
  badge: free book · GitHub
  description: Interactive Jupyter book on Kalman and particle filters.
  tags:
  - book
  - GitHub
  - Python
- name: Introduction to Visual SLAM (slambook-en)
  url: https://github.com/gaoxiang12/slambook-en
  category: SLAM & state estimation
  badge: free book · GitHub
  description: English edition of the popular '14 Lectures on Visual SLAM'.
  tags:
  - book
  - GitHub
- name: ORB-SLAM3
  url: https://github.com/UZ-SLAMLab/ORB_SLAM3
  category: SLAM & state estimation
  badge: GitHub
  description: Reference open-source visual-inertial SLAM system to study and run.
  tags:
  - GitHub
- name: Planning Algorithms (Steven LaValle)
  url: https://lavalle.pl/planning/
  category: Motion planning
  badge: free book
  description: The classic motion-planning textbook, free online.
  tags:
  - book
- name: PythonRobotics
  url: https://github.com/AtsushiSakai/PythonRobotics
  category: Motion planning
  badge: GitHub
  description: Readable Python implementations of planning, localization, SLAM and control algorithms.
  tags:
  - GitHub
  - Python
- name: OMPL
  url: https://ompl.kavrakilab.org/
  category: Motion planning
  badge: official docs
  description: The Open Motion Planning Library behind MoveIt, with tutorials.
  tags:
  - docs
- name: ETH Zurich Autonomous Mobile Robots
  url: https://asl.ethz.ch/education/lectures/autonomous_mobile_robots.html
  category: Mobile robots, drones & AVs
  badge: course page · ETH Zurich
  description: Locomotion, perception, localization and planning for mobile robots.
  tags:
  - course
  - ETH
- name: 'ETHx: Self-Driving Cars with Duckietown'
  url: https://www.edx.org/learn/technology/eth-zurich-self-driving-cars-with-duckietown
  category: Mobile robots, drones & AVs
  badge: free to audit · edX
  description: Build autonomy for a small self-driving car, in simulation or on a Duckiebot.
  tags:
  - course
  - audit
- name: Duckietown docs
  url: https://docs.duckietown.com/
  category: Mobile robots, drones & AVs
  badge: official docs
  description: Learning materials and hands-on guides for the Duckietown platform.
  tags:
  - docs
  - projects
- name: Self-Driving Cars (U. Toronto, Coursera)
  url: https://www.coursera.org/specializations/self-driving-cars
  category: Mobile robots, drones & AVs
  badge: free to audit · Coursera
  description: 'Four courses: state estimation, perception and motion planning for self-driving cars.'
  tags:
  - course
  - audit
- name: 'Self-Driving Car Fundamentals: Featuring Apollo'
  url: https://www.udacity.com/course/self-driving-car-fundamentals-featuring-apollo--ud0419
  category: Mobile robots, drones & AVs
  badge: free course · Udacity
  description: Free Udacity course on the parts of a self-driving car, built with Baidu Apollo.
  tags:
  - course
- name: 'MIT VNAV: Visual Navigation for Autonomous Vehicles'
  url: https://ocw.mit.edu/courses/16-485-visual-navigation-for-autonomous-vehicles-vnav-fall-2020/
  category: Mobile robots, drones & AVs
  badge: free course · MIT OCW
  description: Luca Carlone's course on geometry, estimation and visual navigation for drones and cars.
  tags:
  - course
  - MIT
- name: PX4 Autopilot docs
  url: https://docs.px4.io/main/en/
  category: Mobile robots, drones & AVs
  badge: official docs
  description: 'Open-source drone flight stack: setup, simulation and ROS 2 integration.'
  tags:
  - docs
  - drones
- name: Autoware docs
  url: https://docs.autoware.org/main/
  category: Mobile robots, drones & AVs
  badge: official docs
  description: Open-source self-driving software stack built on ROS 2.
  tags:
  - docs
  - self-driving
- name: Robotic Manipulation (Russ Tedrake, MIT)
  url: https://manipulation.csail.mit.edu/
  category: Manipulation
  badge: free course + book · MIT
  description: MIT 6.421 notes, lectures and runnable notebooks on perception, planning and control for manipulation.
  tags:
  - course
  - book
  - MIT
- name: Drake
  url: https://drake.mit.edu/
  category: Manipulation
  badge: official docs
  description: Model-based design and verification for robotics, used in Tedrake's courses.
  tags:
  - docs
  - sim
- name: Robotics Toolbox for Python (Peter Corke)
  url: https://github.com/petercorke/robotics-toolbox-python
  category: Manipulation
  badge: GitHub
  description: Kinematics, dynamics and trajectory tools for arms, with many robot models.
  tags:
  - GitHub
  - Python
- name: Hugging Face Robotics Course
  url: https://huggingface.co/learn/robotics-course
  category: Robot learning
  badge: free course · Hugging Face
  description: Hugging Face's robot-learning course built around LeRobot.
  tags:
  - course
  - Hugging Face
- name: LeRobot
  url: https://github.com/huggingface/lerobot
  category: Robot learning
  badge: GitHub · Hugging Face
  description: Datasets, pretrained policies and training code for real-world robot learning in PyTorch.
  tags:
  - GitHub
  - Hugging Face
- name: Hugging Face Deep RL Course
  url: https://huggingface.co/learn/deep-rl-course
  category: Robot learning
  badge: free course · Hugging Face
  description: Hands-on deep reinforcement learning from Q-learning to PPO, with certificate.
  tags:
  - course
  - Hugging Face
- name: UC Berkeley CS285 Deep Reinforcement Learning
  url: https://rail.eecs.berkeley.edu/deeprlcourse/
  category: Robot learning
  badge: course · Berkeley
  description: Sergey Levine's deep RL course with recorded lectures.
  tags:
  - course
  - video
- name: Stanford CS224R Deep Reinforcement Learning
  url: https://cs224r.stanford.edu/
  category: Robot learning
  badge: course · Stanford
  description: Chelsea Finn's deep RL course, including imitation and robot learning.
  tags:
  - course
  - Stanford
- name: OpenAI Spinning Up
  url: https://spinningup.openai.com/
  category: Robot learning
  badge: free guide
  description: Educational deep RL resource with clear algorithm write-ups and code.
  tags:
  - guide
- name: David Silver's RL course
  url: https://davidstarsilver.wordpress.com/teaching/
  category: Robot learning
  badge: free lectures
  description: The classic UCL/DeepMind reinforcement learning lectures and slides.
  tags:
  - course
  - video
- name: Underactuated Robotics (Russ Tedrake, MIT)
  url: https://underactuated.mit.edu/
  category: Robot learning
  badge: free course + book · MIT
  description: Nonlinear dynamics, optimal control, trajectory optimization and RL for walking and flying robots.
  tags:
  - course
  - book
  - MIT
- name: OpenVLA
  url: https://openvla.github.io/
  category: Robot foundation models
  badge: open model
  description: 7B open-source vision-language-action model trained on Open X-Embodiment.
  tags:
  - model
  - GitHub
- name: openpi (π0 / π0.5)
  url: https://github.com/Physical-Intelligence/openpi
  category: Robot foundation models
  badge: GitHub · Physical Intelligence
  description: Open weights and code for Physical Intelligence's π0 family of VLA models.
  tags:
  - model
  - GitHub
- name: Open X-Embodiment
  url: https://robotics-transformer-x.github.io/
  category: Robot foundation models
  badge: dataset
  description: Large open dataset pooled from many labs and robot types, plus RT-X models.
  tags:
  - dataset
- name: Octo
  url: https://octo-models.github.io/
  category: Robot foundation models
  badge: open model
  description: Open generalist transformer policy, easy to fine-tune.
  tags:
  - model
- name: Diffusion Policy
  url: https://diffusion-policy.cs.columbia.edu/
  category: Robot foundation models
  badge: paper + code
  description: Visuomotor policies trained as diffusion models, a common imitation-learning baseline.
  tags:
  - paper
  - GitHub
- name: NVIDIA Isaac GR00T
  url: https://github.com/NVIDIA/Isaac-GR00T
  category: Robot foundation models
  badge: GitHub · NVIDIA
  description: Open foundation model for humanoid robots, with fine-tuning code.
  tags:
  - model
  - GitHub
  - NVIDIA
- name: 'PennX: Robotics: Locomotion Engineering'
  url: https://www.edx.org/learn/robotics/university-of-pennsylvania-robotics-locomotion-engineering
  category: Humanoids & legged
  badge: free to audit · edX
  description: Penn's course on the dynamics and control of legged locomotion.
  tags:
  - course
  - audit
- name: legged_gym
  url: https://github.com/leggedrobotics/legged_gym
  category: Humanoids & legged
  badge: GitHub · ETH Zurich
  description: ETH's environments for training legged robots to walk with massively parallel RL.
  tags:
  - GitHub
  - ETH
- name: MuJoCo Playground
  url: https://github.com/google-deepmind/mujoco_playground
  category: Humanoids & legged
  badge: GitHub · DeepMind
  description: GPU-accelerated environments for locomotion and manipulation, including humanoids, with sim-to-real examples.
  tags:
  - GitHub
  - sim
- name: HumanoidBench
  url: https://humanoid-bench.github.io/
  category: Humanoids & legged
  badge: benchmark
  description: Simulated humanoid benchmark for whole-body locomotion and manipulation.
  tags:
  - benchmark
- name: SO-ARM100 / SO-101
  url: https://github.com/TheRobotStudio/SO-ARM100
  category: Projects
  badge: GitHub · open hardware
  description: Open-source low-cost robot arm used with LeRobot, with print files and build guides.
  tags:
  - projects
  - GitHub
  - hardware
- name: TurtleBot3 e-Manual
  url: https://emanual.robotis.com/docs/en/platform/turtlebot3/overview/
  category: Projects
  badge: official docs
  description: Setup, SLAM, navigation and manipulation tutorials for the TurtleBot3 ROS robot.
  tags:
  - projects
  - ROS 2
- name: F1TENTH course kit
  url: https://f1tenth-coursekit.readthedocs.io/
  category: Projects
  badge: free course kit
  description: Lectures, labs and assignments for building and racing a 1/10-scale autonomous car.
  tags:
  - projects
  - course
- name: Introduction to Autonomous Robots (Correll)
  url: https://github.com/Introduction-to-Autonomous-Robots/Introduction-to-Autonomous-Robots
  category: Projects
  badge: free book · GitHub
  description: Open textbook covering locomotion, sensors, planning and manipulation.
  tags:
  - book
  - GitHub
---

## How to use this course

Go in order: every chapter uses the ones before it. Read the explanation, play with the simulation until the equations feel obvious, run the code, then take the quiz. Mark a chapter done and the page remembers where you were, in this browser only, with no account. When a chapter clicks, follow its "go deeper" links: those are full free university courses, textbooks and official docs.

## FAQ

### Can I learn robotics engineering for free?

Yes. Every course, textbook and tool linked here is free to use or audit: MIT OpenCourseWare, Stanford, ETH Zurich, QUT Robot Academy, the Modern Robotics book and videos, and the official ROS 2, Gazebo, MuJoCo and Isaac docs. ROS 2, Gazebo, MuJoCo and Python are free software. The only real cost is hardware, and you can do most of this course in simulation.

### What math do I need for robotics?

Linear algebra (vectors, matrices, rotations), calculus and ordinary differential equations (motion), and probability (noisy sensors). Chapters 1–4 teach the geometry you need as you go, and 3Blue1Brown's *Essence of linear algebra* is the best free refresher.

### Should I learn ROS 2?

Yes, if you want to build real robots or work in industry: it is the standard way to connect drivers, perception, planning and control. Learn the core ideas first (chapters 1–12 here), then do the official ROS 2 tutorials; chapter 13 explains nodes, topics, services, actions and QoS.

### Python or C++ for robotics?

Both. Python for prototyping, machine learning and most of this course; C++ for real-time control and performance-critical ROS 2 nodes. Start with Python.

### How long does this take?

Reading and playing with all 16 chapters takes about 7 hours. Working through the linked courses properly takes months: treat each chapter's "go deeper" list and build project as the real work.

### Are the simulations accurate?

They use the real equations: RK4 integration, discrete-time LQR, a particle filter, A*, RRT and Q-learning, written from scratch and unit-tested against closed-form answers (pendulum periods, overshoot formulas, Riccati solutions, value iteration). They are simplified to 2-D so they run on a phone, not replacements for Gazebo or MuJoCo.

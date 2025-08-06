import DynamicActor from "../DynamicActor.js";

class BouncyBallActor extends DynamicActor {
  constructor(config) {
    super(config);
    this.imageNames.push("Misc/bouncy_ball.png");
  }
}

export default BouncyBallActor;

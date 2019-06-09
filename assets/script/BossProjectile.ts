import { EnemyType } from "./EnemyType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BossProjectileClass extends cc.Component {

    initialSpeed = 600;
    speed = 0;
    speedMultiplyFactor = 100;

    MAX_RANGE = -1000;

    enemyType: EnemyType = EnemyType.BOSS;
    isExist = false;
    damage = 50;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.speed = this.initialSpeed;
    }

    update (dt) {
        if (this.isExist) {
            this.node.x -= this.speed * dt;
            this.speed += this.speedMultiplyFactor * dt;
            if (this.node.scaleY > 0.3) {
                this.node.scaleY -= dt / 3;
            }
            if (this.node.x < this.MAX_RANGE) {
                this.isExist = false;
                this.node.destroy();
            }
        }
    }
}

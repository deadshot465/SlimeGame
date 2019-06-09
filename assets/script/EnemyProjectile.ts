import { EnemyType } from "./EnemyType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnemyProjectileClass extends cc.Component {

    @property
    xSpeed = 350;

    MAX_RANGE = -1000;

    isExist = false;

    enemyType: EnemyType;
    damage = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        switch (this.enemyType) {
            case EnemyType.WHITE:
                this.damage = 10;
                break;
            case EnemyType.YELLOW:
                this.damage = 20;
                break;
            case EnemyType.BLUE:
                this.damage = 30;
                break;
            case EnemyType.RED:
                this.damage = 40;
                break;
        }
    }

    update (dt) {
        if (this.isExist) {
            this.node.x -= this.xSpeed * dt;
            if (this.node.x < this.MAX_RANGE) {
                this.isExist = false;
                this.node.destroy();
            }
        }
    }
}

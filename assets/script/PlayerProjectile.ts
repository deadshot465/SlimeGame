const {ccclass, property} = cc._decorator;

@ccclass
export default class ProjectileClass extends cc.Component {

    @property
    xSpeed = 350;

    private MAX_RANGE = 1000;

    isExist = false;
    isSpecial = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    }

    start () {

    }

    update (dt) {
        if (this.isExist) {
            this.node.x += this.xSpeed * dt;
            if (this.node.x > this.MAX_RANGE) {
                this.isExist = false;
                this.node.destroy();
            }
        }
    }
}

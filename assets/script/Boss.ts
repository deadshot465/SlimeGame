import GameClass from "./Game";
import BossProjectileClass from "./BossProjectile";
import ProjectileClass from "./PlayerProjectile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BossClass extends cc.Component {

    canvasComponent: GameClass = null;

    isExist = false;

    bossSpeedFactor = 100;
    topYOffset = 230;
    bottomYOffset = 40;
    moveStarted = false;
    originalPosition: cc.Vec2 = null;
    targetPosition: cc.Vec2 = null;

    hp = 0;
    baseHp = 300;
    hpFactor = 200;
    damageRadius = 60;

    @property(cc.Prefab)
    bossProjectile: cc.Prefab = null;
    projectileFired = false;
    fireInterval = 0.0;
    elapsedTime = 0.0;

    bossFire(dt: any) {
        if (this.isExist) {
            if (!this.projectileFired) {
                let projectile = cc.instantiate(this.bossProjectile);
                this.canvasComponent.node.addChild(projectile);
                projectile.setPosition(this.node.x - 100, this.node.y);
                projectile.setScale(1.5);
                let projectileComponent = projectile.getComponent<BossProjectileClass>(BossProjectileClass);
                projectileComponent.isExist = true;
                this.fireInterval = Math.random() * 9;
                this.projectileFired = true;
            } else {
                this.elapsedTime += dt;
                if (this.elapsedTime > this.fireInterval) {
                    this.elapsedTime = 0.0;
                    this.projectileFired = false;
                }
            }
        }
    }

    async bossDamage() {
        let playerProjectiles = this.canvasComponent
        .getComponentsInChildren<ProjectileClass>(ProjectileClass);

        for (let projectile of playerProjectiles) {
            let distance = this.node.position.sub(projectile.node.position).mag();
            if (distance < this.damageRadius) {
                projectile.isExist = false;
                projectile.node.stopAllActions();
                projectile.node.destroy();
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.hp = this.baseHp + Math.random() * this.hpFactor;
    }

    update (dt) {
        if (this.isExist) {
            if (!this.moveStarted) {
                let targetY = Math.random() * 2 * this.canvasComponent.node.y - this.canvasComponent.node.y;
                if (targetY > this.canvasComponent.node.y - this.topYOffset) {
                    targetY = this.canvasComponent.node.y - this.topYOffset;
                } else if (targetY < -this.canvasComponent.node.y + this.bottomYOffset) {
                    targetY = -this.canvasComponent.node.y + this.bottomYOffset;
                }
                this.targetPosition = new cc.Vec2(this.node.x, targetY);
                this.moveStarted = true;
            } else {
                if (this.targetPosition.y < this.node.y) {
                    this.node.y -= this.bossSpeedFactor * dt;
                    if (this.node.y < this.targetPosition.y) {
                        this.moveStarted = false;
                    }
                } else {
                    this.node.y += this.bossSpeedFactor * dt;
                    if (this.node.y > this.targetPosition.y) {
                        this.moveStarted = false;
                    }
                }
            }

            this.bossFire(dt);
            this.bossDamage();
        }
    }
}
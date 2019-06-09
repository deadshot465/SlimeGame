import GameClass from "./Game";
import EnemyProjectileClass from "./EnemyProjectile";
import ProjectileClass from "./PlayerProjectile";
import { EnemyType } from "./EnemyType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnemyClass extends cc.Component {

    canvasComponent: GameClass = null;

    enemyType: EnemyType;
    damage = 0;

    @property
    xSpeed = 0;

    @property
    ySpeed = 0;

    @property(cc.Prefab)
    enemyProjectile: cc.Prefab = null;

    blinkAnimation: cc.Animation = null;

    isExist = false;
    projectileFired = false;
    fireInterval = 0.0;
    elapsedTime = 0.0;

    xSpeedFactor = 0.0;
    ySpeedFactor = 0.0;
    originalPosition: cc.Vec2;
    playerPosition: cc.Vec2;
    t = 0.0;

    MAX_RANGE = -1000;

    damageRadius = 60;

    enemyFire(dt: any) {
        if (this.isExist) {
            if (!this.projectileFired) {
                let projectile = cc.instantiate(this.enemyProjectile);
                this.canvasComponent.node.addChild(projectile);
                projectile.setScale(0.7);
                projectile.setPosition(this.node.x  - 100, this.node.y);
                projectile.getComponent<EnemyProjectileClass>(EnemyProjectileClass).isExist = true;
                projectile.getComponent<EnemyProjectileClass>(EnemyProjectileClass).enemyType = this.enemyType;
                this.fireInterval = Math.random() * 6;
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

    async enemyDamage() {
        let playerProjectiles = this.canvasComponent
        .getComponentsInChildren<ProjectileClass>(ProjectileClass);
        
        for (let projectile of playerProjectiles) {
            let distance = this.node.position.sub(projectile.node.position).mag();
            if (distance < this.damageRadius) {
                projectile.isExist = false;
                projectile.node.stopAllActions();
                projectile.node.destroy();
                this.isExist = false;
                this.node.stopAllActions();
                if (this.blinkAnimation !== null) {
                    await this.showBlink();
                }
                this.node.destroy();

                switch (this.enemyType) {
                    case EnemyType.WHITE:
                        this.canvasComponent.getScore(10);
                        break;
                    case EnemyType.YELLOW:
                        this.canvasComponent.getScore(20);
                        break;
                    case EnemyType.BLUE:
                        this.canvasComponent.getScore(30);
                        break;
                    case EnemyType.RED:
                        this.canvasComponent.getScore(40);
                        break;
                }
            }
        }
    }

    showBlink(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let state = this.blinkAnimation.play('Blink', 0);
            this.blinkAnimation.on('finished', (event: cc.Event.EventCustom) => {
                resolve();
            });
        })
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    start () {
        this.originalPosition = this.node.position;
        this.playerPosition = this.canvasComponent.player.getPosition();
        this.xSpeedFactor = this.xSpeed / 100.0;
        this.ySpeedFactor = this.ySpeed / 100.0;

        switch (this.enemyType) {
            case EnemyType.WHITE:
                this.damage = 15;
                break;
            case EnemyType.YELLOW:
                this.damage = 25;
                break;
            case EnemyType.BLUE:
                this.damage = 35;
                break;
            case EnemyType.RED:
                this.damage = 45;
                break;
        }

        let animations = this.node.getComponents<cc.Animation>(cc.Animation);
        for (let animation of animations) {
            if (!animation.playOnLoad) {
                this.blinkAnimation = animation;
                break;
            }
        }
    }

    update (dt) {
        if (this.isExist) {
            this.t += dt / this.xSpeedFactor;
            let moveDistance = this.originalPosition.lerp(this.playerPosition, this.t);
            this.node.setPosition(moveDistance);

            if (this.node.position.y < this.MAX_RANGE) {
                this.node.destroy();
            }

            this.enemyFire(dt);
            this.enemyDamage();
        }
    }
}

import GameClass from "./Game";
import EnemyProjectileClass from "./EnemyProjectile";
import ProjectileClass from "./PlayerProjectile";
import { EnemyType } from "./EnemyType";
import PlayerClass from "./Player";

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

    @property({
        type: cc.AudioClip
    })
    attackingSound: cc.AudioClip = null;

    private blinkAnimation: cc.Animation = null;

    isExist = false;
    private projectileFired = false;
    private fireInterval = 0.0;
    private elapsedTime = 0.0;

    private xSpeedFactor = 0.0;
    private ySpeedFactor = 0.0;
    private originalPosition: cc.Vec2;
    private playerPosition: cc.Vec2;
    private t = 0.0;

    private MAX_RANGE = -500;

    private damageRadius = 60;

    private enemyFire(dt: any) {
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
                //this.playAttackingSound();
            } else {
                this.elapsedTime += dt;
                if (this.elapsedTime > this.fireInterval) {
                    this.elapsedTime = 0.0;
                    this.projectileFired = false;
                }
            }
        }
    }

    private async enemyDamage(other: cc.Node) {
        if (this.isValid) {
            this.node.getComponent<cc.BoxCollider>(cc.BoxCollider).enabled = false;
            let component = other
            .getComponent<ProjectileClass>(ProjectileClass);
            let playerComponent = this.canvasComponent.player
            .getComponent<PlayerClass>(PlayerClass);
            if (component.isSpecial) {
                switch (this.enemyType) {
                    case EnemyType.WHITE:
                        playerComponent.setSpecialProjectile(0, true);
                        break;
                    case EnemyType.YELLOW:
                        playerComponent.setSpecialProjectile(1, true);
                        break;
                    case EnemyType.BLUE:
                        playerComponent.setSpecialProjectile(2, true);
                        break;
                    case EnemyType.RED:
                        playerComponent.setSpecialProjectile(3, true);
                        break;
                }
                this.canvasComponent.attackPoint = 0;
            }
            component.isExist = false;
            component.node.stopAllActions();
            component.node.destroy();
            this.isExist = false;
            this.node.stopAllActions();
            if (this.blinkAnimation !== null) {
                await this.showBlink();
            }
            this.node.destroy();

            if (!playerComponent.specialAttackHit.hit) {
                switch (this.enemyType) {
                    case EnemyType.WHITE:
                        this.canvasComponent.getAttackPoint(5);
                        break;
                    case EnemyType.YELLOW:
                        this.canvasComponent.getAttackPoint(10);
                        break;
                    case EnemyType.BLUE:
                        this.canvasComponent.getAttackPoint(15);
                        break;
                    case EnemyType.RED:
                        this.canvasComponent.getAttackPoint(20);
                        break;
                }
            } else {
                switch (this.enemyType) {
                    case EnemyType.WHITE:
                        this.canvasComponent.getAttackPoint(
                            playerComponent.specialAttackHit.value === 0 ?
                            10 : 0
                        );
                        break;
                    case EnemyType.YELLOW:
                        this.canvasComponent.getAttackPoint(
                            playerComponent.specialAttackHit.value === 1 ?
                            30 : 0
                        );
                        break;
                    case EnemyType.BLUE:
                        this.canvasComponent.getAttackPoint(
                            playerComponent.specialAttackHit.value === 2 ?
                            60 : 0
                        );
                        break;
                    case EnemyType.RED:
                        this.canvasComponent.getAttackPoint(
                            playerComponent.specialAttackHit.value === 3 ?
                            100 : 0
                        );
                        break;
                }
            }
        }
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        this.enemyDamage(other.node);
    }

    private showBlink(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let state = this.blinkAnimation.play('Blink', 0);
            this.blinkAnimation.on('finished', (event: cc.Event.EventCustom) => {
                resolve();
            });
        })
    }

    private playAttackingSound() {
        cc.audioEngine.playEffect(this.attackingSound, false);
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
        }
    }
}

import GameClass from "./Game";
import BossProjectileClass from "./BossProjectile";
import ProjectileClass from "./PlayerProjectile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BossClass extends cc.Component {

    canvasComponent: GameClass = null;

    isExist = false;

    originalPosition: cc.Vec2 = null;
    private bossSpeedFactor = 100;
    private topYOffset = 230;
    private bottomYOffset = 40;
    private moveStarted = false;
    private targetPosition: cc.Vec2 = null;

    private hp = 5000;
    private baseHp = 5000;
    private hpFactor = 200;
    private damageRadius = 60;

    @property(cc.SpriteFrame)
    bossHappySprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bossDeadSprite: cc.SpriteFrame = null;
    private isBossDead = false;

    @property(cc.Prefab)
    bossProjectile: cc.Prefab = null;
    private projectileFired = false;
    private fireInterval = 0.0;
    private elapsedTime = 0.0;

    @property({
        type: cc.AudioClip
    })
    attackingSound: cc.AudioClip = null;

    private bossFire(dt: any) {
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
                this.playAttackingSound();
            } else {
                this.elapsedTime += dt;
                if (this.elapsedTime > this.fireInterval) {
                    this.elapsedTime = 0.0;
                    this.projectileFired = false;
                }
            }
        }
    }

    private bossDamage(other: cc.Node) {
        let component = other.getComponent<ProjectileClass>(ProjectileClass);
        component.isExist = false;
        component.node.stopAllActions();
        component.node.destroy();
        if (this.hp > 0) {
            this.hp -= this.canvasComponent.attackPoint;
            this.hp = Math.round(this.hp);
            if (this.hp <= 0) {
                this.bossDied();
            }
            this.canvasComponent.bossHpLabel.string = `Boss HP: ${this.hp}`;
        } else {
            this.bossDied();
        }
    }

    onCollisionEnter(other: cc.PolygonCollider, self: cc.PolygonCollider) {
        this.bossDamage(other.node);
    }

    private playAttackingSound() {
        //cc.audioEngine.playEffect(this.attackingSound, false);
        cc.loader.loadRes('442827__qubodup__fireball', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    private bossDied() {
        this.hp = 0;
        this.canvasComponent.bossHpLabel.string = `Boss HP: ${this.hp}`;
        this.node.stopAllActions();
        this.node.getComponent<cc.Sprite>(cc.Sprite).spriteFrame = this.bossDeadSprite;
        this.isBossDead = true;
    }

    bossVictory() {
        this.node.getComponent<cc.Sprite>(cc.Sprite).spriteFrame = this.bossHappySprite;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.hp = this.baseHp;
        this.hp = Math.round(this.hp);
        this.canvasComponent.bossHpLabel.string = `Boss HP: ${this.hp}`;
    }

    update (dt) {
        if (this.isExist) {
            if (this.isBossDead) {
                if (this.node.opacity > 10) {
                    let randomX = Math.floor(Math.random() * 40) - 20;
                    randomX += this.canvasComponent.enemyOriginalX;
                    this.node.x = randomX;
                    this.node.opacity -= 50 * dt;
                } else {
                    this.node.stopAllActions();
                    this.canvasComponent.gameSuccess();
                }
            } else {
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
            }
        }
    }
}

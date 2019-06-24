import GameClass from "./Game";
import ProjectileClass from "./PlayerProjectile";
import EnemyProjectileClass from "./EnemyProjectile";
import EnemyClass from "./Enemy";
import { EnemyType } from "./EnemyType";
import BossProjectileClass from "./BossProjectile";
import BossClass from "./Boss";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerClass extends cc.Component {

    @property(cc.Prefab)
    playerProjectile: cc.Prefab = null;

    @property(cc.Prefab)
    specialProjectile: cc.Prefab = null;
    private specialAttack = false;
    private specialUsedCount = 0;

    specialAttackHit = {
        hit: false,
        value: -1
    }

    @property([cc.Prefab])
    changedProjectiles: cc.Prefab[] = new Array<cc.Prefab>(4);

    @property(cc.Node)
    canvasNode: cc.Node = null;

    @property(cc.Node)
    heart1: cc.Node = null;

    @property(cc.Node)
    heart2: cc.Node = null;

    @property(cc.Node)
    heart3: cc.Node = null;

    @property(cc.SpriteFrame)
    halfHeart: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    deadSprite: cc.SpriteFrame = null;

    @property({
        type: cc.AudioClip
    })
    attackingSound: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    changedAttackSound: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    damagingSound: cc.AudioClip = null;

    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;
    private fire = false;

    @property
    xSpeed = 0;

    @property
    ySpeed = 0;

    private xOffset = 40;
    private bottomYOffset = this.xOffset;
    private topYOffset = 230;
    private elapsedTime = 0.0;
    private isFired = false;

    private hp = 300;
    private damageRadius = 60;
    
    private damageAnimation = new Array<cc.Animation>(4);

    onKeyDown(event: any) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.moveLeft = true;
                break;
            case cc.macro.KEY.d:
                this.moveRight = true;
                break;
            case cc.macro.KEY.w:
                this.moveUp = true;
                break;
            case cc.macro.KEY.s:
                this.moveDown = true;
                break;
            case cc.macro.KEY.q:
                this.fire = true;
                this.specialAttack = false;
                break;
            case cc.macro.KEY.e:
                if (this.specialUsedCount < 3) {
                    this.fire = true;
                    this.specialAttack = true;
                    this.specialUsedCount += 1;
                }
                break;
            case cc.macro.KEY.up:
                this.moveUp = true;
                break;
            case cc.macro.KEY.down:
                this.moveDown = true;
                break;
        }
    }

    onKeyUp(event: any) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.moveLeft = false;
                break;
            case cc.macro.KEY.d:
                this.moveRight = false;
                break;
            case cc.macro.KEY.w:
                this.moveUp = false;
                break;
            case cc.macro.KEY.s:
                this.moveDown = false;
                break;
            case cc.macro.KEY.q:
                this.fire = false;
                this.specialAttack = false;
                break;
            case cc.macro.KEY.e:
                this.fire = false;
                this.specialAttack = false;
                break;
            case cc.macro.KEY.up:
                this.moveUp = false;
                break;
            case cc.macro.KEY.down:
                this.moveDown = false;
                break;
        }
    }

    setSpecialProjectile(projectileNo: number, enabled: boolean) {
        this.playerProjectile = this.changedProjectiles[projectileNo];
        this.specialAttackHit.hit = enabled;
        this.specialAttackHit.value = projectileNo;
    }

    private async playerDamage(other: cc.Node) {
        
        if (!this.canvasNode.getComponent<GameClass>(GameClass).bossAppeared) {
            let component = 
            other.getComponent<EnemyProjectileClass>(EnemyProjectileClass) === null ?
            other.getComponent<EnemyClass>(EnemyClass) :
            other.getComponent<EnemyProjectileClass>(EnemyProjectileClass);
            
            component.isExist = false;
            component.node.stopAllActions();
            this.node.stopAllActions();
            this.hp -= component.damage;
            component.node.destroy();
            await this.showDamageAnimation(component);
            this.playDamagingSound();
            this.checkHp();
            this.node.resumeAllActions();
        } else {
            let component = other
            .getComponent<BossProjectileClass>(BossProjectileClass);
            component.isExist = false;
            component.node.stopAllActions();
            this.node.stopAllActions();
            this.hp -= component.damage;
            component.node.destroy();
            await this.showDamageAnimation(component);
            this.playDamagingSound();
            this.checkHp();
            this.node.resumeAllActions();
        }
        
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        this.playerDamage(other.node);
    }

    private checkHp() {
        if (this.heart3.isValid) {
            if (this.hp < 250) {
                let sprite = this.heart3.getComponent<cc.Sprite>(cc.Sprite);
                sprite.spriteFrame = this.halfHeart;
            }
            if (this.hp < 200) {
                this.heart3.destroy();
            }
        }
        
        if (this.heart2.isValid) {
            if (this.hp < 150) {
                let sprite = this.heart2.getComponent<cc.Sprite>(cc.Sprite);
                sprite.spriteFrame = this.halfHeart;
            }
            if (this.hp < 100) {
                this.heart2.destroy();
            }
        }
        
        if (this.heart1.isValid) {
            if (this.hp < 50) {
                let sprite = this.heart1.getComponent<cc.Sprite>(cc.Sprite);
                sprite.spriteFrame = this.halfHeart;
            }
            if (this.hp < 0) {
                this.heart1.destroy();
                this.hp = 0;
                this.node.stopAllActions();
                this.node.getComponent<cc.Sprite>(cc.Sprite).spriteFrame = this.deadSprite;
                if (this.canvasNode.getComponent<GameClass>(GameClass).bossAppeared) {
                    this.canvasNode.getComponentInChildren<BossClass>(BossClass).bossVictory();
                }
                this.canvasNode.getComponent<GameClass>(GameClass).gameOver();
            }
        }
    }

    private showDamageAnimation(projectile: EnemyProjectileClass | EnemyClass | BossProjectileClass): Promise<any> {
        switch (projectile.enemyType) {
            case EnemyType.WHITE:
                return new Promise<any>((resolve, reject) => {
                    this.damageAnimation[0].play();
                    this.damageAnimation[0].on('finished', (event: cc.Event.EventCustom) => {
                        resolve();
                    });
                });
            case EnemyType.YELLOW:
                return new Promise<any>((resolve, reject) => {
                    this.damageAnimation[1].play();
                    this.damageAnimation[1].on('finished', (event: cc.Event.EventCustom) => {
                        resolve();
                    });
                });
            case EnemyType.BLUE:
                return new Promise<any>((resolve, reject) => {
                    this.damageAnimation[2].play();
                    this.damageAnimation[2].on('finished', (event: cc.Event.EventCustom) => {
                        resolve();
                    });
                });
            case EnemyType.RED:
                return new Promise<any>((resolve, reject) => {
                    this.damageAnimation[3].play();
                    this.damageAnimation[3].on('finished', (event: cc.Event.EventCustom) => {
                        resolve();
                    });
                });
            case EnemyType.BOSS:
                return new Promise<any>((resolve, reject) => {
                    this.damageAnimation[3].play();
                    this.damageAnimation[3].on('finished', (event: cc.Event.EventCustom) => {
                        resolve();
                    });
                });
        }
    }

    private playAttackingSound() {
        //cc.audioEngine.playEffect(this.attackingSound, false);
        cc.loader.loadRes('41530__jamius__slimeatk', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    private playChangedAttackSound() {
        //cc.audioEngine.playEffect(this.changedAttackSound, false);
        cc.loader.loadRes('391660__jeckkech__projectile', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    private playDamagingSound() {
        //cc.audioEngine.playEffect(this.damagingSound, false);
        cc.loader.loadRes('72624__anechoix__squish3', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    private playCutscene(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.canvasNode.getComponent<GameClass>(GameClass).playCutscene();
        });
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start () {
        let animations = this.node.getComponents<cc.Animation>(cc.Animation);
        for (let i = 0; i < animations.length; i++) {
            if (!animations[i].playOnLoad) {
                if (animations[i].defaultClip.name === 'SlimeDamage0') {
                    this.damageAnimation[0] = animations[i];
                } else if (animations[i].defaultClip.name === 'SlimeDamage1') {
                    this.damageAnimation[1] = animations[i];
                } else if (animations[i].defaultClip.name === 'SlimeDamage2') {
                    this.damageAnimation[2] = animations[i];
                } else if (animations[i].defaultClip.name === 'SlimeDamage3') {
                    this.damageAnimation[3] = animations[i];
                }
            }
        }
    }

    update (dt) {

        if (this.isFired) {
            this.elapsedTime += dt;
            if (this.elapsedTime > 0.5) {
                this.elapsedTime = 0.0;
                this.isFired = false;
            }
        }

        if (this.moveUp) {
            this.node.y += this.ySpeed * dt;
        }
        if (this.moveDown) {
            this.node.y -= this.ySpeed * dt;
        }

        if (this.fire && !this.isFired) {
            let projectile = this.specialAttack ?
            cc.instantiate(this.specialProjectile) :
            cc.instantiate(this.playerProjectile);

            if (this.specialAttack) {
                this.playCutscene();
            }

            this.canvasNode.addChild(projectile);
            projectile.setPosition(this.node.x + 50, this.node.y);
            projectile.getComponent<ProjectileClass>(ProjectileClass).isExist = true;
            projectile.getComponent<ProjectileClass>(ProjectileClass).isSpecial = 
            this.specialAttack;
            this.isFired = true;
            if (this.specialAttackHit.hit) {
                this.playChangedAttackSound();
            } else {
                this.playAttackingSound();
            }
        }

        if (this.node.x < -this.canvasNode.x + this.xOffset) {
            this.node.x = -this.canvasNode.x + this.xOffset;
        }
        if (this.node.x > this.canvasNode.x - this.xOffset) {
            this.node.x = this.canvasNode.x - this.xOffset;
        }

        if (this.node.y < -this.canvasNode.y + this.bottomYOffset) {
            this.node.y = -this.canvasNode.y + this.bottomYOffset;
        }
        if (this.node.y > this.canvasNode.y - this.topYOffset) {
            this.node.y = this.canvasNode.y - this.topYOffset;
        }

    }
}

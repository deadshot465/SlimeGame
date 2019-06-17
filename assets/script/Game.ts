import EnemyClass from "./Enemy";
import { EnemyType } from "./EnemyType";
import EnemyProjectileClass from "./EnemyProjectile";
import BossClass from "./Boss";
import { DataClass, DatabaseClass } from "./Database";
import ScoreBoardClass from "./Scoreboard";
import BossProjectileClass from "./BossProjectile";
import ProjectileClass from "./PlayerProjectile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameClass extends cc.Component {

    @property([cc.Prefab])
    ghosts: cc.Prefab[] = [null];

    @property(cc.Prefab)
    boss: cc.Prefab = null;

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;
    score = 0;
    
    @property(cc.RichText)
    gameOverLabel: cc.RichText = null;

    @property(cc.Node)
    restartButton: cc.Node = null;

    @property({
        type: cc.AudioClip
    })
    gameOverSound: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    gameSuccessSound: cc.AudioClip = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;
    timePassed = 0;
    timeRemained = 60;

    @property(cc.Label)
    bossHpLabel: cc.Label = null;

    @property(cc.Node)
    editBox: cc.Node = null;

    @property(cc.Node)
    scoreboard: cc.Node = null;
    scoreResults: object[] = null;

    @property(cc.Node)
    cutsceneNode: cc.Node = null;
    specialAttackCutscene: cc.Animation = null;

    @property(cc.Node)
    warningNode: cc.Node = null;

    bossAppeared = false;
    elapsedTime = 0.0;
    ghostSpawned = false;
    enemyOriginalX = 300;
    interval = 0.0;

    spawnEnemy() {
        let rand = Math.random();
        let ghost: cc.Node;
        let enemyType: EnemyType;

        if (rand <= 0.4) {
            ghost = cc.instantiate(this.ghosts[0]);
            enemyType = EnemyType.WHITE;
        } else if (rand > 0.4 && rand <= 0.7) {
            ghost = cc.instantiate(this.ghosts[1]);
            enemyType = EnemyType.YELLOW;
        } else if (rand > 0.7 && rand <= 0.9) {
            ghost = cc.instantiate(this.ghosts[2]);
            enemyType = EnemyType.BLUE;
        } else {
            ghost = cc.instantiate(this.ghosts[3]);
            enemyType = EnemyType.RED;
        }


        this.node.addChild(ghost);
        let randomYPosition = this.player.position.y + (Math.random() - 0.5) * 400;
        ghost.setPosition(this.enemyOriginalX, randomYPosition);
        ghost.getComponent<EnemyClass>(EnemyClass).canvasComponent = this;
        ghost.getComponent<EnemyClass>(EnemyClass).isExist = true;
        ghost.getComponent<EnemyClass>(EnemyClass).enemyType = enemyType;
        this.ghostSpawned = true;
    }

    getScore(score: number) {
        this.score += score;
        this.scoreLabel.string = `Attack: ${this.score}`;
    }

    clearAllProjectiles() {
        let enemyProjectiles = this.node
        .getComponentsInChildren<EnemyProjectileClass>(EnemyProjectileClass);
        for (let projectile of enemyProjectiles) {
            projectile.node.destroy();
        }

        let bossProjectiles = this.node
        .getComponentsInChildren<BossProjectileClass>(BossProjectileClass);
        for (let projectile of bossProjectiles) {
            projectile.node.destroy();
        }

        let playerProjectiles = this.node
        .getComponentsInChildren<ProjectileClass>(ProjectileClass);
        for (let projectile of playerProjectiles) {
            projectile.node.destroy();
        }
    }

    clearAllEnemies() {
        
        this.clearAllProjectiles();
    
        let enemies = this.node.getComponentsInChildren<EnemyClass>(EnemyClass);
        for (let enemy of enemies) {
            enemy.node.destroy();
        }

    }

    gameOver(win: boolean = false) {
        this.clearAllEnemies();
        cc.director.pause();
        this.gameOverLabel.enabled = true;
        if (!win) {
            this.playGameOverSound();
        }
        this.restartButton.active = true;
    }

    playGameOverSound() {
        //cc.audioEngine.playEffect(this.gameOverSound, false);
        cc.loader.loadRes('253886__themusicalnomad__negative-beeps', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    gameSuccess() {
        cc.director.pause();
        this.playGameSuccessSound();
        this.clearAllProjectiles();

        this.editBox.active = true;
    }

    playGameSuccessSound() {
        //cc.audioEngine.playEffect(this.gameSuccessSound, false);
        cc.loader.loadRes('341985__unadamlar__goodresult', cc.AudioClip, (err, clip: cc.AudioClip) => {
            cc.audioEngine.playEffect(clip, false);
        });
    }

    async onRecordEntered(event: cc.Event, customEventData: any) {
        let name = this.editBox.getComponent<cc.EditBox>(cc.EditBox).string;
        let db = new DatabaseClass();
        await db.writeData(name, this.score, Math.ceil(this.timePassed)).then((value) => {
            console.log(`Resolved: ${value}`);
        }).catch((reason) => {
            console.error(`Rejected: ${reason}`);
        });
        this.showScoreboard();
    }

    async showScoreboard() {
        this.editBox.active = false;
        let db = new DatabaseClass();
        await db.readData(this).then((value) => {
            console.log(`Resolved: ${value}`);
        }).catch((reason) => {
            console.error(`Rejected: ${reason}`);
        });
        this.node.getComponentInChildren<BossClass>(BossClass).node.active = false;
        this.clearAllEnemies();
        this.scoreboard.active = true;
        let scoreboardComponent = this.scoreboard.getComponent<ScoreBoardClass>(ScoreBoardClass);
        let data = new Array<DataClass>();
        for (let i = 0; i < this.scoreResults.length; i++) {
            let item = this.scoreResults[i] as DataClass;
            data.push(item);
        }
        let result = data.sort((a, b) => {
            if (a.DefeatTime === b.DefeatTime) {
                return 0;
            }
            return a.DefeatTime > b.DefeatTime ? 1 : -1;
        }).slice(0, 5);
        for (let i = 0; i < result.length; i++) {
            scoreboardComponent.setName(i, result[i].Name);
            scoreboardComponent.setAttack(i, result[i].AttackPoint);
            scoreboardComponent.setTime(i, result[i].DefeatTime);
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onRestartButtonClicked(event: cc.Event, customEventData: any) {
        cc.director.loadScene('main');
        this.gameOverLabel.enabled = false;
        this.restartButton.active = false;
        cc.director.resume();
    }

    onKeyUp(event: any) {
        switch (event.keyCode) {
            case cc.macro.KEY.escape:
                this.scoreboard.active = false;
                this.gameOver(true);
                break;
        }
    }

    playCutscene(): Promise<any> {
        let originalColor = new Array<cc.Color>();
        for (let i = 0; i < this.node.children.length; i++) {
            originalColor.push(this.node.children[i].color);
        }
        return new Promise((resolve, reject) => {
            for (let node of this.node.children) {
                if (node !== null && node.isValid) {
                    if (node.name === 'Cutscene') {
                        break;
                    } else {
                        node.color = new cc.Color(100, 100, 100, node.color.getA());
                        node.pauseAllActions();
                    }
                }
            }
            this.specialAttackCutscene.play();
            this.specialAttackCutscene.on('finished', (event: cc.Event.EventCustom) => {
                for (let i = 0; i < this.node.children.length; i++) {
                    let node = this.node.children[i];
                    if (node !== null && node.isValid) {
                        if (node.name === 'Cutscene') {
                            break;
                        } else {
                            node.color = originalColor[i];
                            node.resumeAllActions();
                        }
                    }
                }
                resolve();
            });
        });
    }

    playWarningTitle(): Promise<any> {
        return new Promise((resolve, reject) => {
            let animation = this.warningNode.getComponent<cc.Animation>(cc.Animation);
            animation.play();
            let audioId: number;
            cc.loader.loadRes('135613__danielnieto7__alert', cc.AudioClip, (err, clip: cc.AudioClip) => {
                audioId = cc.audioEngine.playEffect(clip, true);
            });
            animation.on('finished', (event) => {
                cc.audioEngine.stopEffect(audioId);
                this.warningNode.active = false;
                resolve();
            });
        });
    }

    showWarning(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            await this.playWarningTitle();
            resolve();
        })
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDrawBoundingBox = false;
    }

    start () {
        this.gameOverLabel.enabled = false;
        this.scoreResults = new Array<object>();
        this.specialAttackCutscene = this.cutsceneNode.getComponent<cc.Animation>(cc.Animation);
    }

    update (dt) {

        if (!this.bossAppeared) {
            if (!this.ghostSpawned) {
                this.spawnEnemy();
                this.interval = Math.random() * 3;
            } else if (this.ghostSpawned) {
                this.elapsedTime += dt;
                if (this.elapsedTime > this.interval) {
                    this.elapsedTime = 0.0;
                    this.ghostSpawned = false;
                }
            }

            if (this.timeRemained > 0) {
                this.timePassed += dt;
                this.timeRemained = 60 - Math.round(this.timePassed);
                this.timerLabel.string = `Time: ${this.timeRemained}`;
            } else {
                this.bossAppeared = true;
                this.clearAllEnemies();
                this.timePassed = 0;

                this.showWarning().then((value) => {
                    let boss = cc.instantiate(this.boss);
                    this.node.addChild(boss);
                    boss.setScale(new cc.Vec2(1.2, 1.2));
                    let pos = new cc.Vec2(this.enemyOriginalX, this.player.y);
                    boss.setPosition(pos);
                    let bossComponent = boss.getComponent<BossClass>(BossClass);
                    bossComponent.isExist = true;
                    bossComponent.canvasComponent = this;
                    bossComponent.originalPosition = pos;
                    this.bossHpLabel.node.active = true;
                });
            }
        } else {
            this.timePassed += dt;
            this.timerLabel.string = `Time: ${Math.round(this.timePassed)}`;
        }
    }
}

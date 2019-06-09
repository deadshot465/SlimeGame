import EnemyClass from "./Enemy";
import { EnemyType } from "./EnemyType";
import EnemyProjectileClass from "./EnemyProjectile";
import BossClass from "./Boss";

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

    @property(cc.Label)
    timerLabel: cc.Label = null;
    timePassed = 0;
    timeRemained = 60;

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
        this.scoreLabel.string = `Score: ${this.score}`;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    }

    start () {
        let test = fetch('https://yesno.wtf/api')
        .then((value: Response) => value.json())
        .then((value: any) => console.log(JSON.stringify(value)));
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
                let enemyProjectiles =
                 this.node.getComponentsInChildren<EnemyProjectileClass>(EnemyProjectileClass);
                for (let projectile of enemyProjectiles) {
                    projectile.node.destroy();
                }
    
                let enemies = this.node.getComponentsInChildren<EnemyClass>(EnemyClass);
                for (let enemy of enemies) {
                    enemy.node.destroy();
                }
                this.timePassed = 0;

                let boss = cc.instantiate(this.boss);
                this.node.addChild(boss);
                boss.setScale(new cc.Vec2(1.2, 1.2));
                let pos = new cc.Vec2(this.enemyOriginalX, this.player.y);
                boss.setPosition(pos);
                let bossComponent = boss.getComponent<BossClass>(BossClass);
                bossComponent.isExist = true;
                bossComponent.canvasComponent = this;
                bossComponent.originalPosition = pos;
            }
        } else {
            this.timePassed += dt;
            this.timerLabel.string = `Time: ${Math.round(this.timePassed)}`;
        }
    }
}

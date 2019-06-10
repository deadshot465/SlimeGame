const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    backgroundNode: cc.Node = null;
    backgroundAnimation: cc.Animation = null;

    @property(cc.Node)
    mainTitle: cc.Node = null;

    @property(cc.Node)
    exclamation: cc.Node = null;
    showExclamation = false;

    @property(cc.Node)
    whiteFlash: cc.Node = null;

    @property(cc.Node)
    loadingSceneSlime: cc.Node = null;
    slimeColorChanged = false;

    @property(cc.Node)
    startButton: cc.Node = null;

    @property(cc.Node)
    manualButton: cc.Node = null;

    @property(cc.Node)
    manualBoard: cc.Node = null;
    manualOpened = false;

    elapsedTime = 0.0;

    gameStart = false;
    slimeMoveMaxRange = 500;
    onStartButtonClick(event: cc.Event, customEventData: any) {
        this.gameStart = true;
    }

    onKeyUp(event: any) {
        if (this.manualOpened) {
            switch (event.keyCode) {
                case cc.macro.KEY.q:
                    this.toggleManual();
                    break;
                case cc.macro.KEY.e:
                    this.toggleManual();
                    break;                    
            }
        }
    }

    onManualButtonClick(event: cc.Event, customEventData: any) {
        this.toggleManual();
    }

    toggleManual() {
        this.backgroundAnimation.enabled = !(this.backgroundAnimation.enabled);
        this.loadingSceneSlime.active = !(this.loadingSceneSlime.active);
        this.manualBoard.active = this.manualBoard.active === true ? false : true;
        this.manualOpened = !(this.manualOpened);
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start () {
        this.mainTitle.opacity = 0;
        this.backgroundAnimation = this.backgroundNode.getComponent<cc.Animation>(cc.Animation);
        this.backgroundAnimation.enabled = false;
    }

    update (dt) {
        this.elapsedTime += dt;

        if (this.elapsedTime > 2 && this.mainTitle.opacity <= 255) {
            if (!this.mainTitle.active) {
                this.mainTitle.active = true;
            }
            this.mainTitle.opacity += 5 * Math.ceil(dt);
        }
        if (this.mainTitle.opacity >= 255 && !this.backgroundAnimation.enabled) {
            this.showExclamation = true;
        }

        if (this.elapsedTime > 4 && this.showExclamation && !this.manualOpened) {
            this.exclamation.active = true;
            this.backgroundAnimation.enabled = true;
        }

        if (this.exclamation.active) {
            this.whiteFlash.active = true;
        }

        if (this.whiteFlash.active) {
            this.loadingSceneSlime.active = true;
            this.startButton.active = true;
            this.manualButton.active = true;
        }

        if (this.gameStart) {
            this.backgroundAnimation.enabled = false;
            if (this.backgroundAnimation.node.opacity < 255) {
                this.backgroundAnimation.node.opacity += 5 * Math.ceil(dt);
            }
            let i = this.loadingSceneSlime.color.getR();
            while (i < 255 && !this.slimeColorChanged) {
                console.log(this.loadingSceneSlime.color.getR());
                let newColor = new cc.Color(i, i, i, this.loadingSceneSlime.color.getA());
                this.loadingSceneSlime.color = newColor;
                i += Math.ceil(dt);
            }
            this.slimeColorChanged = true;
            this.loadingSceneSlime.x += 350 * dt;
            if (this.loadingSceneSlime.x > this.slimeMoveMaxRange) {
                cc.director.loadScene('main');
            }
        }
    }
}

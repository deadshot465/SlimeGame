const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingSceneClass extends cc.Component {

    @property(cc.Node)
    backgroundNode: cc.Node = null;
    private backgroundAnimation: cc.Animation = null;

    @property(cc.Node)
    mainTitle: cc.Node = null;

    @property(cc.Node)
    exclamation: cc.Node = null;
    private showExclamation = false;

    @property(cc.Node)
    whiteFlash: cc.Node = null;

    @property(cc.Node)
    loadingSceneSlime: cc.Node = null;
    private slimeColorChanged = false;

    @property(cc.Node)
    startButton: cc.Node = null;

    @property(cc.Node)
    manualButton: cc.Node = null;

    @property(cc.Node)
    manualBoard: cc.Node = null;
    private manualOpened = false;

    private elapsedTime = 0.0;

    private gameStart = false;
    private slimeMoveMaxRange = 500;
    private sceneLoaded = false;

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
                case cc.macro.KEY.escape:
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
        cc.director.preloadScene('main');
        if (window["firstTimeManual"] === null || window["firstTimeManual"] === undefined)
        {
            window["firstTimeManual"] = false;
        }
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
            if (!window["firstTimeManual"]) {
                window["firstTimeManual"] = true;
                this.toggleManual();
            }
        }

        if (this.gameStart) {
            this.backgroundAnimation.enabled = false;
            if (this.backgroundAnimation.node.opacity < 255) {
                this.backgroundAnimation.node.opacity += 5 * Math.ceil(dt);
            }
            let i = this.loadingSceneSlime.color.getR();
            while (i < 255 && !this.slimeColorChanged) {
                let newColor = new cc.Color(i, i, i, this.loadingSceneSlime.color.getA());
                this.loadingSceneSlime.color = newColor;
                i += Math.ceil(dt);
            }
            this.slimeColorChanged = true;
            if (this.loadingSceneSlime.x > this.slimeMoveMaxRange && !this.sceneLoaded) {
                cc.director.loadScene('main');
                this.sceneLoaded = true;
            } else {
                this.loadingSceneSlime.x += 350 * dt;
            }
        }
    }
}

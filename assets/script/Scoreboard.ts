const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreBoardClass extends cc.Component {

    @property([cc.Label])
    nameComponents: cc.Label[] = [null];

    @property([cc.Label])
    attackComponents: cc.Label[] = [null];
    
    @property([cc.Label])
    timeComponents: cc.Label[] = [null];

    setName(index: number, value: string) {
        this.nameComponents[index].string = value;
    }

    setAttack(index: number, value: number) {
        this.attackComponents[index].string = value.toString();
    }

    setTime(index: number, value: number) {
        this.timeComponents[index].string = value.toString();
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}

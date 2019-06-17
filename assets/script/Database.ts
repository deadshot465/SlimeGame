import GameClass from "./Game";

export class DatabaseClass {

    //writeData(attackPoint: number, defeatTime: number): Promise<Response | any> {
    //    return fetch('https://gameresults-e2b5.restdb.io/rest/slime-game-results', {
    //        method: 'POST',
    //        headers: {
    //            'Accept': '*/*',
    //            'Access-Control-Allow-Origin': '*',
    //            'Content-Type': 'application/json',
    //            'x-apikey': '5cfec47f02e89f03fadefc8d'
    //        },
    //        body: JSON.stringify({
    //            "Name": "AAA",
    //            "AttackPoint": attackPoint,
    //            "DefeatTime": defeatTime
    //        })
    //    }).then((response) => response, (reason) => reason);
    //
    //}

    writeData(name: string, attackPoint: number, defeatTime: number): Promise<object> {
        return new Promise((resolve, reject) => {
            try {
                let result: object;
                let xhr = new XMLHttpRequest();
                xhr.timeout = 10000;
                xhr.withCredentials = true;
                xhr.addEventListener('readystatechange', () => {
                    console.log(`HTTP Status: ${xhr.status}`);
                    console.log(`HTTP Status Text: ${xhr.statusText}`);
                    if (xhr.readyState === 4) {
                        result = JSON.parse(xhr.responseText);
                        console.log(xhr.responseText);
                        resolve(result);
                    }
                });

                xhr.open('POST', 'https://gameresults-e2b5.restdb.io/rest/slime-game-results');
                xhr.setRequestHeader('accept', '*');
                xhr.setRequestHeader('access-control-allow-origin', '*');
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.setRequestHeader('x-apikey', '5cfec47f02e89f03fadefc8d');
                xhr.setRequestHeader('cache-control', 'no-cache');

                console.log(`Name: ${name}`);
                console.log(`AttackPoint: ${attackPoint}`);
                console.log(`DefeatTime: ${defeatTime}`);

                let data = JSON.stringify({
                    'Name': name,
                    'AttackPoint': attackPoint,
                    'DefeatTime': defeatTime
                });
                xhr.send(data);
                
                xhr.ontimeout = (ev: ProgressEvent) => {
                    reject('Request timeout reached.');
                }

                xhr.onerror = (ev: ProgressEvent) => {
                    reject('An error occurred connecting to the server.');
                }

            } catch (error) {
                reject(`An error occurred connecting to the server: ${error}`);
            }
        });
    }

    readData(game: GameClass): Promise<object[]> {

        let generateDummyData = () => {
            for (let i = 0; i < 5; i++) {
                let data = new DataClass();
                data.Id = 0;
                data._id = '';
                data.Name = 'インタネット無効';
                data.AttackPoint = 0;
                data.DefeatTime = 0;
                game.scoreResults.push(data);
            }
        }

        return new Promise((resolve, reject) => {
            let result: object[];
            let xhr = new XMLHttpRequest();
            xhr.timeout = 10000;
            xhr.withCredentials = true;
            xhr.addEventListener('readystatechange', () => {
                console.log(`HTTP Status: ${xhr.status}`);
                console.log(`HTTP Status Text: ${xhr.statusText}`);
                if (xhr.readyState === 4) {
                    if (xhr.responseText !== null) {
                        result = JSON.parse(xhr.responseText);
                        game.scoreResults = result;
                        resolve(result);
                    } else {
                        generateDummyData();
                        reject('No data available.');
                    }
                }
            });

            xhr.open('GET', 'https://gameresults-e2b5.restdb.io/rest/slime-game-results');
            xhr.setRequestHeader('accept', '*');
            xhr.setRequestHeader('access-control-allow-origin', '*');
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader('x-apikey', '5cfec47f02e89f03fadefc8d');
            xhr.setRequestHeader('cache-control', 'no-cache');

            let data: any;
            xhr.send(data);

            xhr.ontimeout = (ev: ProgressEvent) => {
                generateDummyData();
                reject('Request timeout reached.');
            }

            xhr.onerror = (ev: ProgressEvent) => {
                generateDummyData();
                reject('An error occurred connecting to the server.');
            }
        });
    }
}

export class DataClass {
    Id: number;
    Name: string;
    AttackPoint: number;
    DefeatTime: number;
    _id: string;
}
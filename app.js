'use strict';
// Node.jsのモジュールをよびだしている
// fsはファイルシステム
// readlineはファイルを一行ずつ読み込むためのモジュール
const fs = require('fs');
const readline = require('readline');
// ファイル読み込みStreamを生成
// readlineオブジェクトのinputに設定
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rlオブジェクトで、lineというイベントが発生したら無名関数を呼ぶよう設定
rl.on('line', (lineString) => {
    // lineイベントが発生すると読み込んだ一行をコンソールにログとして出力
//    console.log(lineString);
    
    // 2010年と2015年のデータから「集計年」「都道府県」「15～19歳の人口」を抜き出す
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu =parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
 //       console.log(year);
 //       console.log(prefecture);
 //       console.log(popu);
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            // 最初は必ずvalueがFalsyなのでここにくる
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            // 男女で別カラムなので足す
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        prefectureDataMap.set(prefecture, value);

    }
});
// ストリームに情報を流し始める
rl.resume();
rl.on('close', () => {
    // 都道府県ごとの変化率を計算
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
//    console.log(prefectureDataMap);
    // データの並べ替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        // 比較関数
        // 前者pair1を後者pair2より前にしたいときは、負の整数、
        // pair2をpair1より前にしたいときは、正の整数
        // 並びをそのままにしたいときは、0である必要がある
        return pair1[1].change - pair2[1].change;
    });
//    console.log(rankingArray);
    const rankingStrings = rankingArray.map(([key, value], i) => {
        return (i + 1) + '位 ' + key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    console.log(rankingStrings);
});
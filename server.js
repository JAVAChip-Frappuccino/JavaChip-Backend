const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const url = "mongodb+srv://admin:1234@cluster0.yrinhkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const mongoclient = require('mongodb').MongoClient;



const express = require("express");
const path = require('path');
const app = express();

//몽고db 연결 
mongoclient.connect(url) 
  .then(client => {
    mydb = client.db('Javachip');
    //db에 있는 데이터 출력하기
    printCollection("account");
    printCollection("calendar");
    printCollection("community");
    printCollection("likes");
    printCollection("saved");
  })
  .catch(err => {
    console.log(err);
});


function printCollection(collectionName) {
  mydb.collection(collectionName).find().toArray()
    .then(result => {
      console.log(`=== ${collectionName} ===`);
      console.log(result);
    })
    .catch(err => {
      console.error(`Error fetching ${collectionName}:`, err);
    });
}


app.get("/api/calendar", async (req, res) => {
  const data = await mydb.collection("calendar").find().toArray();
  res.json(data); // 프론트로 JSON 응답
});

app.get("/api/calendar", async (req, res) => {
  try {

    // 쿼리에서 year, month 받기 
    //ex)  /api/calendar?year=2025&month=8
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month); 

    if (!year || !month) {
      return res.status(400).json({ error: "year와 month를 쿼리로 전달해주세요." });
    }

    const data = await mydb.collection("calendar").find().toArray();

    // 같은 달 데이터만 필터
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month; // JS에서 getMonth()는 0~11
    });

    // 총합 계산
    let totalIncome = 0;
    let totalExpense = 0;
    

    filteredData.forEach(item => {
      if (item.type === 'income') totalIncome += item.amount;
      else if (item.type === 'expense') totalExpense += item.amount;
    });

    const total = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      total,
      data: filteredData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 에러" });
  }
});

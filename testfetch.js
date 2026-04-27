fetch('http://localhost:3000/api/history?symbol=BTC%2FUSDT&interval=1m').then(r=>r.json()).then(d=>console.log(d.length)).catch(console.error)

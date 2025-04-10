const express = require('express');
const cluster = require('cluster');
const os=require('os');
const PORT = 3000;
const totalCPUs=os.cpus().length;

if(cluster.isPrimary){
  console.log(`Number of CPU's is ${totalCPUs}`)
  console.log(`Primary ${process.pid} is running`);

  // fork workers
  for(let i=0;i<totalCPUs;i++){
    cluster.fork();
  }

  cluster.on("exit",(worker,code,signal)=>{
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
}
else{
  const app=express();
  console.log(`Worker ${process.pid} started`);
  app.get("/",(req,res)=>{
    res.send("hello world");
  })
  app.get("/api/:n",function(req,res){
    let n=parseInt(req.params.n);
    let count=0;
    if(n>500000000)n=5000000;
    for(let i=0;i<=n;i++){
      count+=i;
    }
    res.send(`Final count is ${count} on process ${process.pid}`)
  })


const server = app.listen(PORT);

// Listen for successful start
server.on('listening', () => {
  console.log(`✅ Server is up and running on port ${PORT}`);
});

// Listen for errors like port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Choose a different one.`);
  } else {
    console.error('❌ Server failed to start:', err);
  }
  process.exit(1); // Exit cleanly
});
}

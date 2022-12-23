//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
require("dotenv").config();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://"+process.env.myusername+":"+process.env.mypass+"@cluster0.qz4botc.mongodb.net/toDolistDB", {useNewUrlParser : true});

const ItemsSchema={
  name:String
};

const Item = mongoose.model("Item",ItemsSchema);

const item1 = new Item({
  name :"WELCOME TO YOUR TODOLIST"
});

const item2= new Item({
  name: "Hit + button to add new item."
});

const item3= new Item({
  name: "<-- Hit this to delete an item."
});


const defaultItems =[item1,item2,item3];

const ListSchema ={
  name : String,
  items: [ItemsSchema]
};

const List =mongoose.model("List",ListSchema);


app.get("/", function(req, res) {



    Item.find({},function(err,founditems){

    if(founditems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success added");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newListItems: founditems});
    }
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;


  const anotherItem = new Item({
    name : itemName
  });

  if(listname === "Today"){
    anotherItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(anotherItem);
      foundList.save();
      res.redirect("/"+listname);
    });
  }
});

app.post("/delete",function(req,res){
  const idName=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(idName,function(err){
      if(!err){
        console.log("Item deleted successfully!");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{ $pull :{ items: {_id : idName}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

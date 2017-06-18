var colorname = require('colornames');
var mongoose = require('mongoose');
var moment = require('moment');
var app = new Clarifai.App(
    'K8J_lX6FnTLD7uuY9W7q6525o4tAeFRPX4KE-ItX',
    'Qk4_mQvQRQWwe48F69Gdv56meiHCUqRg4lM7aW8R'
  );
  
new Vue({
  el:'#maindiv',
  data:{
    appName:'App Collection',
    model:'',
    results:'No results yet',
    imgsrc:[],
    time:new Date(),
    loading:false,
    startTime:'',
    search:'',
    searchResults:[],
    nopics:false,
    showClock:false,
    autosearch:'',
    autosearchEnabled:true,
    blogs: new Map(),
    bodyColor: $('#main').css('background-color'),
    colorValue:'',
    blogCount:0,
    blogColor:''
  },
  created:function(){$('#colorH4').hide();
  },
  methods:{
    changeColor:function(){
      var newColor = $('#color').val().toLowerCase().trim().replace(/\s/g,'');
     if(newColor!=='' && colorname(newColor)!==undefined){
     $('#main').css('background-color',colorname(newColor));
       $('#colorH4').show();
       this.colorValue = "RGB Value: "+ colorname(newColor);
       $('#colorH4').css('filter','invert(100%)');
     }
    else if(newColor!=='' && colorname(newColor)===undefined){
      this.colorValue = "Whoops, that's not a color! Try again!";
     $('#colorH4').show();
    }
      else {$('#main').css('background-color','#D8BFD8');
        $('#colorH4').hide();
      }
    },
    submit: function(){
      if(this.model.length<5 || this.model.length>5){
        this.results = "Error: Invalid amount of characters";
        return;
      }
      else if(this.model.match(/[^0-9]/)){
        this.results = "Error: Numeric characters only";
        return;
      }
      this.results = "Searching...";
      this.$http.get('https://ziptasticapi.com/'+this.model).then(function(data){
        if(data.body.city){
        this.results = data.body.city.toLowerCase().split(" ").map(_.upperFirst).join(" ")+", "+data.body.state;
        }
        else if(data.body.error)
        this.results = "Error: "+data.body.error;
      });
      this.model='';
    },
    getpic: function(){
      const app = this;
      const pics = $('img');
      $('iframe').css('visibility','hidden');
      $('iframe').css('display','none');
      this.loading=true;
      this.imgsrc=[];
      for(let i=0;i<10;i++){
        //Note: have to ignore certification errors to make this work since it's not https
      this.$http.get('http://www.splashbase.co/api/v1/images/random').then(function(data){
        if(data.status==200)
      this.imgsrc.push(data.body.url);
        
        if(this.imgsrc.length==6){
          this.loading=false;
        
        }
      });
      }
      $('#pics').show();
      $('img').show();

    },
    toggle: function(){
      $('#pics').fadeToggle();
    },
    setTime:function(){
      this.showClock=true;
      $('#text').text('');
      startTime=window.setInterval(function(){
        $('#time').text(moment().format('MMMM Do YYYY, h:mm:ss a'));
      },1000);
    },
    stopTime:function(){
      window.clearInterval(startTime);
    },
    toggleTime:function(){
      this.showClock=!this.showClock;
    },
    youtube:function(e){
      var app = this;
      if(e.target.id==="youtube" && this.autosearchEnabled===false){
        window.clearInterval(this.autosearch);
        return;
      }
      if((e.target.id==="youtube" && this.autosearchEnabled===true) || (e.target.id==="searchbutton" && this.autosearchEnabled===false)){
      this.autosearch=window.setTimeout(function(){
      if(app.search.length>0){
        app.loading=true;
        app.nopics=true;
        var frames = document.querySelectorAll('iframe');
      $('img').hide();
      $('#pics').show();
      $('iframe').css('visibility','visible');
      $('iframe').css('display','block');
      app.$http.get('https://www.googleapis.com/youtube/v3/search/?key=AIzaSyA_jINAeNztUqe-i8vxqej4xFhhnUMkZxo&part=snippet&maxResults=20&q='+app.search).then(function(data){
        for(var i=0;i<data.body.items.length;i++){
          if(data.body.items[i].id.videoId!=undefined && app.searchResults.length<6)
          app.searchResults.push(data.body.items[i].id.videoId);
        }
        for(var i=0;i<frames.length;i++){
        frames[i].setAttribute('src','https://www.youtube.com/embed/'+app.searchResults[i]+'?origin=http://example.com');
         }
      });
      app.loading=false;
      app.searchResults=[];
      app.search='';
    }
      },2000);
      }
    },
    toggleAutosearch: function(){
      this.autosearchEnabled=!this.autosearchEnabled;
      var button = document.querySelector('#youtube');
    if(this.autosearchEnabled===false){
      $('#autosearchButton').css('background-color','red');
      $('#autosearchButton').text('Autosearch Disabled');
      
    }
    else {
    $('#autosearchButton').css('background-color','green');
    $('#autosearchButton').text('Autosearch Enabled');
    }
  },
  getInfo: function(e){
    app.models.predict(Clarifai.GENERAL_MODEL, e.target.src).then(
  function(response) {
    console.log(response);
    var imageResults={};
    var imageString='';
    for(var i=0;i<5;i++){
      imageResults[response.outputs[0].data.concepts[i].name]=Math.round(response.outputs[0].data.concepts[i].value*100,3)+"%";
      imageString+=`<li><span style="font-weight:bold">${Object.keys(imageResults)[i]}</span>: 
      ${Object.values(imageResults)[i]}</li>`
    }
    swal({
      title:'Clarifai Results:',
      imageUrl:e.target.src,
      imageHeight:120,
      imageWidth:200,
      html:`<div><ul>${imageString}</ul></div>`,
      background:'#D8BFD8'
    });
  },
  function(err) {
    console.error(err);
  }
);
  },
  launchBlog: function(){
    const app = this;
swal({
   title: 'New Blog Post',
   height:1000,
   showCancelButton: true,
   confirmButtonColor: '#DD6B55',
   confirmButtonText: 'Submit',
   background:'#AA9DF1',
   html:`<div id='newBlogDiv'><form><label for='title'>Title: <input style='width:250px;' id='title'>
    </label><label for='contents'>Contents: <textarea id='contents'></textarea>
    </label></form></div>`,
   preConfirm: function () {
    return new Promise(function (resolve) {
      resolve([
        $('#title').val(),
        $('#contents').val()
      ])
    })},
   closeOnConfirm: true
   }).then(function (result) {
    console.log(result);
    
    if(!app.blogs.has(result[0])){
    app.blogs.set(result[0],result[1])
    swal({
    html:
      "Blog post saved!",
      background: '#AA9DF1'
  }).then(()=>app.showPosts());
    }
    
    else{
      swal({html:"<div><h1>Sorry. There's already a post with that name. Please try again.</h1></div><textarea>"+
        result[1]+"</textarea>"
      }).then(()=>{app.launchBlog;return;});
    }

})
  },
  showPosts: function(){
    const app = this;
    let posts = '';
  if(!this.blogs.size==0){
    this.blogs.forEach((value,key)=>{
    posts+=`<div style='border-radius:25px;'><span id='postSpan${key}'><h3><strong>${key}</strong></h3><div id='${key}div'></div><button id='show${key}'>Show</button> <button id='edit${key}'>Edit</button>
    <button id='delete${key}'>Delete</button></span></div><hr>`;
    
    });
  }
  else{
    swal({html:`<nav><button id='addBtn'">Add Post</button></nav><hr><div>
    <h3>Nothing here yet!</h3></div>`,showCloseButton:true,showConfirmButton:false,
      background: '#AA9DF1'
    });
    $('#addBtn').click(function(){
      app.launchBlog();
    }).then(function(){
    });
    
  }
  
    swal({html:`<nav><button id='addBtn'>Add Post</button></nav><hr><div>${posts}</div>`,showCloseButton:true,showConfirmButton:false,
      background: '#AA9DF1'
    }).then(function(){});
    $('#addBtn').click(function(){
      app.launchBlog();
    });
    var count=1;
    this.blogs.forEach((value,key)=>{
      console.log(key);
      var show = false;
      $('#show'+key).click(function(){
        show = !show;
        $('#'+key+'div').html(`<div style='background-color:#7badfc;border:1px solid black;margin-right:5px;margin-left:5px;border-radius:25px;'><p>${value}</p></div><p></p>`);
        if(show)
        $('#'+key+'div').show();
        else $('#'+key+'div').hide();
      });
      $('#edit'+key).click(function(){
        app.editPost(key);
      });
      $('#delete'+key).click(function(){
        app.deletePost(key);
      });
      if(count % 2===0){
        $('#postSpan'+key).parent().css('background-color','#BFE0E8')
      }
      else $('#postSpan'+key).parent().css('background-color','#BA82D9');
      count++;
    });
    
  },
  editPost:function(post){
    const app = this;
    swal({html:`<div><label>Title <input id='editTitle' value=${post}></label>
    <label>Contents <textarea id='editContent'>${this.blogs.get(post)}</textarea>
    </div>`}).then(function(){
      app.blogs.delete(post);
      app.blogs.set($('#editTitle').val(),$('#editContent').val());
    }).then(function(){app.showPosts();});
  },
  deletePost:function(post){
    this.blogs.delete(post);
    const app = this;
    swal({html:'Deleted!',background:'#AA9DF1'}).then(function(){app.showPosts()});
  }
  }
});

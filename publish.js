var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../talktalk-chatbot.zip');
var kuduApi = 'https://talktalk-chatbot.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$talktalk-chatbot';
var password = 'rgvdlElRj8JFtZGHR0lPGw5xp14vQExEK4gkuNiofzKc3EaDpWwNcAmvlb3Y';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('talktalk-chatbot publish');
  } else {
    console.error('failed to publish talktalk-chatbot', err);
  }
});
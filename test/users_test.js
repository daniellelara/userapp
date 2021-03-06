var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3000/api');
var mongoose = require('mongoose');
var User = require('../models/user');


afterEach(function(done) {
  mongoose.connect('mongodb://localhost/user-app', function(){
    User.create({ username: "lara", email: "y@gmail.com", password: "password",passwordConfirmation: "password" }, function(err, user){
        userId = user._id.toString();
        User.create({ username: "abc", email: "test@gmail.com", password: "password",passwordConfirmation: "password"  }, function(err, usertwo){
            secondId = usertwo._id.toString();
            done(err);
        }); 
    }); 
  });
});


//test returns all users
describe('GET /users', function() {
  before(function(done) {
    api.post('/register')
      .set('Accept', 'application/json')
      .send({ username: "danielle", email: "danielle@gmail.com", password: "password", passwordConfirmation: "password" })
      .end(function(err, res){
        done(err);
      });
  });
  it('should return a 200 response', function(done) {
    api.get('/users')
      .set('Accept', 'application/json')
      .expect(200, done);
  });
  it('should return an array', function(done) {
    api.get('/users')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(res.body).to.be.an('array');
        done();
      });
  });
});  

//test shows user profile
describe('GET /users/:id', function() {
  it('should return a 200 response', function(done) {
    api.get('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(200, done);
  });
  it('should return an object with a specific id', function(done) {
    api.get('/users/' + userId)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(res.body).to.have.property('_id', userId);
        done();
      });
  });
})

//test connect two users
describe('PATCH /users/:id', function(){
  it('should return a 200 response', function(done){
    api.patch('/users/' + secondId)
    .set('Accept', 'application/json')
    .send ({
      friends: userId
    })
    .expect(200, done);
  })
  it('should add an id to friends array', function(done) {
    api.patch('/users/' + secondId)
      .set('Accept', 'application/json')
      .send ({
        friends: userId
      })
      .end(function(err, res) {
        res.body.user.should.have.property('friends');
        res.body.second.friends[0].should.equal(secondId);
        res.body.user.friends[0].should.equal(userId);
        done();
      });
  });
})

//test for unfriending
describe('Patch /users/:id/disconnect', function(){
  before(function(done) {
    api.patch('/users/' + secondId)
      .set('Accept', 'application/json')
      .send ({
        friends: userId
      })
      .end(function(err, res){
        done(err);
      });
  });
  it('should return a 200 response', function(done){
    api.patch('/users/' + secondId +'/disconnect')
      .set('Accept', 'application/json')
      .send ({
        friends: userId
      })
      .end(function(err, res){
        expect(200)
        res.body.should.be.json;
        done();
      });
  })
});

//delete user
describe('DELETE /users/:id', function() {
  it('should return a 204 response', function(done) {
    api.delete('/users/' + userId)
      .set('Accept', 'application/json')
      .expect(204, done);
  });
}); 

//update user info
describe('PUT /users/:id', function(){
  it('should return a 200 response', function(done){
    api.put('/users/' + userId)
      .set('Accept', 'applicaton/json')
      .send({
        username: "changed",
        role: "admin"
      })
      .end(function(err, res){
        res.body.should.be.json;
        res.status.should.equal(200);
        res.body.username.should.equal('changed');
        res.body.role.should.equal('admin');
        done();
      });
  });
}); 
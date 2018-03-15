const mongoose = require('mongoose');
const Band = require('./models');

const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');

describe('Bands', () => {
  before(done => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/test');
    const db = mongoose.connection;
    db.on('error', () => console.error.bind(console, 'connection error'));
    db.once('open', () => {
      console.log('connected');
      done();
    });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });

  describe('getBandName', () => {
    it('should give back the proper band.name', () => {
      const band = new Band({
        name: 'Panic! At the Disco',
        genre: 'Alternative'
      });
      expect(band.getBandName()).to.equal('Panic! At the Disco');
    });
  });

  describe('getAllBands()', () => {
    it('should return all the bands', () => {
      sinon.stub(Band, 'find');
      Band.find.yields(null, [{ name: 'Panic! At the Disco', genre: 'Alternative' }]);
      Band.getAllBands(returnObject => {
        expect(returnObject.length).to.equal(1);
        expect(returnObject[0].name).to.equal('Panic! At the Disco Mouse');
        Band.find.restore();
      });
    });
  });
});
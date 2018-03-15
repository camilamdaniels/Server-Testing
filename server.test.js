const mongoose = require('mongoose');

const chai = require('chai');
const chaihttp = require('chai-http');

const { expect } = chai;
const sinon = require('sinon');

const Band = require('./models');
chai.use(chaihttp);

before((done) => {
	mongoose.connect('mongodb://localhost/test');
	const db = mongoose.connection;
	db.on('error', () => console.error('connection error'));
	db.once('open', () => {
		console.log('database connected');
		done();
	});
});

after((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(done);
	});
});

beforeEach((done) => {
	const band1 = new Band({
		name: 'One Direction',
		genre: 'Boy Band'
	});
	const band2 = new Band({
		name: 'Backstreet Boys',
		genre: 'Boy Band'
	});
	band1.save()
		.then(band => {
			testband1 = band;
			testband1_id = band._id;
		})
		.catch(err => {
			console.error(err);
		});
	band2.save()
		.then(band => {
			testband2 = band;
			testband2_id = band._id;
		})
		.catch(err => {
			console.error(err);
		});
	done();
});

afterEach((done) => {
	Band.remove({}, err => {
		if (err) console.error('Error removing test data');
		done();
	})
})

describe('[POST] /band', () => {
	it('should add a new band', (done) => {
		const newBand = {
			name: 'Radiohead',
			genre: 'Alt-Rock'
		};
		chai.request(server)
			.post('/band')
			.send(newBand)
			.end((err, res) => {
				expect(res.status).to.equal(200);
				expect(res.body.name).to.equal('Radiohead');
				done();
			});
	});

	it('should send back a 422 for bad data', (done) => {
		const newBand = {
			name: 'Radiohead',
			type: 'Alt-Rock'
		};
		chai.request(server)
			.post('/band')
			.send(newBand)
			.end((err, res) => {
				if (err) {
					const expected = 'Input data could not be processed';
					expect(err.status).to.equal(422);
					const { error } = err.response.body;
					expect(error).to.equal(expected);
					done();
				}
			})
	})
})

describe('[GET] /bands', () => {
	it('should return all the expected bands', (done) => {
		chai.request(server);
			.get('/bands')
			.end((err, res) => {
				expect(res.status).to.equal(200);
				expect(res.body[0].name).to.equal(testband1.name);
				expect(res.body[1].name).to.equal(testband2.name);
				expect(res.body[0]._id).to.equal(testband1_id.toString());
				expect(res.body[1]._id).to.equal(testband2_id.toString());
			});
		done();
	});
});

describe('[PUT] /band', () => {
	it('should successfully update a band', (done) => {
		const updatedBand = {
			id: band1.testband1_id,
			name: 'Nsync',
			genre: 'Boy Band'
		}
		chai.request(server)
			.put('/band')
			.send(updatedBand)
			.end((err, res) => {
				expect(res.body.name).to.equal('Nsync');
				expect(res.body.genre).to.equal('Boy Band');
				done();
			});
	});
	it('should return a status of 404 for a nonexistent band', (done) => {
		const updatedBand = {
			id: -1,
			name: 'Rush',
			genre: 'Classic Rock'
		};
		chai.request(server)
			.put('/band')
			.send(updatedBand)
			.end((err, res) => {
				expect(err.status).to.equal(404);
			});
		done();
	})
});
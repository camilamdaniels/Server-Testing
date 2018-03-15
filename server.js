const express = require('express');
const morgan = require('morgan');

const server = express();
server.use(morgan('combined'));
server.use(express.json());

const Band = require('./models');

server.get('/bands', (req, res) => {
	Band.find({}, (err, bands) => {
		if (err) res.status(500).json({ error: 'Internal server error' });
		res.json(bands);
	})
});

server.post('/band', (req, res) => {
	const { name, genre } = req.body;
	const newBand = new Band({ name, genre });
	newBand
		.save()
		.then(band => res.json(band))
		.catch(err => {
			res.status(422).json({ error: 'Input data could not be processed' });
		});
});

server.put('/band', (req, res) => {
	const { name, genre, id } = req.body;
	Band.findById(id, (err, band) => {
		if (err) {
			res.status(404).json({error: 'No band found with that ID'});
			return;
		}
		if (name) {
			band.name = name;
		}
		if (genre) {
			band.genre = genre;
		}
		band.save()
			.then(savedBand => {
				res.json(savedBand);
			})
			.catch(err => {
				res.status(500);
				res.json({ error: 'Failed to update Band with specified id'});
			});
	});
});

module.exports = server;
'use strict';
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const action = async context => {
	const filePath = await context.filePath();

	context.setProgress('Uploading…');

	const s3 = new AWS.S3({
		region: context.config.get('region'),
		accessKeyId: context.config.get('accessKeyId'),
		secretAccessKey: context.config.get('secretAccessKey')
	});

	const split = context.config.get('path').split('/');
	const bucket = split.shift();
	const filename = path.basename(filePath);

	const upload = s3.upload({
		Bucket: bucket,
		Key: path.join(split.join('/'), filename),
		Body: fs.createReadStream(filePath)
	});

	upload.on('httpUploadProgress', progress => {
		const percentage = progress.loaded / progress.total;
		context.setProgress('Uploading…', percentage);
	});

	const response = await upload.promise();

	context.copyToClipboard(response.Location);
	context.notify('S3 URL copied to the clipboard');
};

const s3 = {
	title: 'Share to S3',
	formats: ['gif', 'mp4', 'webm', 'apng'],
	action,
	config: {
		region: {
			title: 'Region',
			type: 'string',
			default: 'us-west-1',
			required: true
		},
		accessKeyId: {
			title: 'Access Key',
			type: 'string',
			required: true
		},
		secretAccessKey: {
			title: 'Secret Access Key',
			type: 'string',
			required: true
		},
		path: {
			title: 'S3 Path',
			type: 'string',
			required: true
		}
	}
};

exports.shareServices = [s3];
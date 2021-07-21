/**
 * Amazon Simple Email Service (SES) Logging
 *
 * It is important to understand that this code is a PROTOTYPE
 * and serves only as a PROOF OF CONCEPT. Use at your own risk!
 * https://github.com/schams-net/amazon-ses-logging
 *
 * Copyright 2019-2021 Michael Schams <schams.net>, MIT License
 * https://schams.net
 */

var aws = require('aws-sdk');
aws.config.update({
    region: 'us-east-1'
});

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var metadata = '';
    var SnsPublishTime = event.Records[0].Sns.Timestamp;
    var Message = event.Records[0].Sns.Message;
    Message = JSON.parse(Message);
    var MessageType = Message.notificationType;
    var MessageId = Message.mail.messageId;
    var SourceArn = Message.mail.sourceArn;
    var Domain = SourceArn.replace(/^.*identity\/(.*)$/gi, '$1');
    var DestinationAddress = Message.mail.destination.toString();

    var dateObj = new Date();
    var month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    var date = ('0' + dateObj.getDate()).slice(-2);
    var year = dateObj.getFullYear();
    var timestamp = dateObj.getTime();

    if (MessageType == 'Bounce') {
        // Extract meta data for bounces
        metadata = metadata.concat(
            'From: ' + Message.mail.commonHeaders.from.toString() + ', ',
            'To: ' + Message.mail.commonHeaders.to.toString() + ', ',
            'Subject: "' + Message.mail.commonHeaders.subject + '" ',
            '(bounce type: ' + Message.bounce.bounceType + ')'
        );
        metadata = metadata.concat("\n",
            JSON.stringify(Message.bounce.bouncedRecipients)
        );
    } else if (MessageType == 'Delivery') {
        // Extract meta data for delivery notifications
        metadata = metadata.concat(
            'From: ' + Message.mail.commonHeaders.from.toString() + ', ',
            'To: ' + Message.mail.commonHeaders.to.toString() + ', ',
            'Subject: "' + Message.mail.commonHeaders.subject + '" ',
            '(' + Message.delivery.smtpResponse + ')'
        );
    } else if (MessageType == 'Complaint') {
        // Extract meta data for complaints
        metadata = metadata.concat(
            'ComplaintFeedbackType: ' + Message.complaint.complaintFeedbackType + ', ',
            'FeedbackId: ' + Message.complaint.feedbackId + ', ',
            'DestinationAddress: ' + DestinationAddress
        );
    }

    // Initialize S3 client
    var s3 = new aws.S3({
        apiVersion: '2006-03-01'
    });
    var uploadParams = {
        // @TODO: enter your s3 bucket name:
        Bucket: 'enter-your-s3-bucket-name-here',
        Key: 'ses/' + Domain + '/' + year + '/' + month + '/' + date + '/' + timestamp + '.' + MessageId,
        Body: '[' + SnsPublishTime + '][' + Domain + '][' + MessageId + '][' + MessageType + ']' + "\n" + metadata + "\n" + JSON.stringify(Message)
    };

    // Upload to S3
    s3.upload(uploadParams, function(err, data) {
        if (err) {
            // Error handling
            console.log("Error", err);
        }
        if (data) {
            // Upload successful
        }
    });
};

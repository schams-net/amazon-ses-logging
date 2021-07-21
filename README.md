# Amazon Simple Email Service (SES) Logging

## Summary

This Git repository contains a simple prototype of an [Amazon Lambda](https://aws.amazon.com/lambda/) function to write [Amazon SES](https://aws.amazon.com/ses/) logs to an [Amazon S3](https://aws.amazon.com/s3/) bucket.

## Background

[Amazon Simple Email Service (SES)](https://aws.amazon.com/ses/) is a high-scale inbound/outbound cloud email service offered by Amazon Web Services (AWS). Compared to traditional SMTP solutions, the service lacks a proper logging functionality that lets system administrators review/debug what happens with emails once they were handed over from the origin system to Amazon SES. This topic was discussed in the [AWS Forum](https://forums.aws.amazon.com/thread.jspa?messageID=990457).

I wrote a simple Lambda function in Node.js version 10 that logs the email meta data to a S3 bucket. I shared the general concept in the forum thread in October 2018. After receiving several requests from the broader community on Twitter, through email, etc. to share the function, I published the code at [GitHub](https://github.com/schams-net/amazon-ses-logging).

## Prototype

It is important to understand that this code is a **prototype** and serves only as a **proof of concept**. I highly recommended to update/rework the code and at least add error handling, etc. to the function. Use at your own risk.

## Concept

When an email is sent through Amazon SES (or bounces or is a complaint), a SNS topic is triggered, and some meta data passed to it. The SNS subscription takes the data and executes the Lambda function, passing the data to it. The Lambda function parses the data, checks the notification type ("Bounce", "Delivery", or "Complaint") and extracts some details from the meta data (note: it makes sense to include all header data when you configure the SES notifications). These details are written to a S3 bucket.

The code as it stands at the moment uses a key that represents the date/time and message ID, for example "`ses/<DOMAIN>/YYYY/MM/DD/<TIMESTAMP>.<MESSAGE-ID>`".

## Setup

(No necessarily in this order)

1. Create a new S3 bucket in the same region as your Amazon SES setup.
2. Create a new Lambda function in the same region as your Amazon SES setup.
3. Attach an IAM role that allows the function to write to a specific S3 bucket.
4. Paste the code from `Lambda/index.js` as your Lambda code and enter the S3 bucket name.
5. Create a new Amazon SNS topic and add a subscription that executes the Lambda function.
6. In Amazon SES, enable all notifications (bounce, complaint, and delivery notifications) and select the SNS topic you created before.

## Notes

If you haven't work with [Amazon Lambda](https://aws.amazon.com/lambda/) yet, the tricky part is probably the configuration of the permissions. Every Lambda function requires appropriate access to the component it uses. In this case, [Amazon SES](https://aws.amazon.com/ses/) triggers the Lambda function and the Lambda function writes data to [Amazon S3](https://aws.amazon.com/s3/). You configure the permissions as a role in [Amazon IAM](https://aws.amazon.com/iam/) and select the role when you create the Lambda function.

## Copyright and License

Copyright 2019-2021 Michael Schams ★ [schams.net](https://schams.net)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[MIT License](https://opensource.org/licenses/MIT)

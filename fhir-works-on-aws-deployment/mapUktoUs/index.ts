/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import AWS from 'aws-sdk';
import axios from 'axios';

/**
 * Custom resource lambda handler that sends record to NHS external API
 * @param event Custom resource request event. See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requests.html
 */
exports.handler = async (event: any) => {
    const access_token = await get_access_token();
    for (let i = 0; i < event.Records.length; i += 1) {
        let record = transform_dynamodb_record(event.Records[i]);
        if (is_bundle(record)) {
            //TODO split the resources and send them one by one
        } else {
            send_resource(record, access_token);
        }
    }
};

const get_access_token = async () => {
    const authorizaion = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET, 'utf8').toString(
        'base64',
    );
    var response = await axios
        .post(
            process.env.EXTERNAL_ENDPOINT + '/oauth2/token',
            {
                grant_type: 'client_credentials',
                scope: 'custom-fhir-scope/default', //TODO should it change
            },
            {
                headers: {
                    Authorization: authorizaion,
                    'content-type': 'x-www-form-urlencoded',
                },
            },
        )
        .then(response => response)
        .catch(error => {
            return error;
        });
    return response['access_token'];
};

const send_resource = (resource, access_token) => {
    axios
        .post(process.env.EXTERNAL_ENDPOINT + '/integration/webservices/jobs/', resource, {
            headers: {
                Authorization: access_token,
                'content-type': 'application/json',
            },
        })
        .then(response => response)
        .catch(error => {
            console.log(error);
        });
};

const is_bundle = resource => {
    return false; //TODO check if this is a bundle
};

const transform_dynamodb_record = record => {
    const ddbJsonImage = record.dynamodb.NewImage;
    return AWS.DynamoDB.Converter.unmarshall(ddbJsonImage);
};

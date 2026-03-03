const amqp = require('amqplib');
const { userCache } = require('../utils/userCache');
require('dotenv').config();

async function setupUsersRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'user_updates';

        await channel.assertQueue(queue, { durable: true });
        console.log('User Service connected to RabbitMQ');

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const userData = JSON.parse(msg.content.toString());
                const cacheKey = `user:${userData._id}`;
                if (userData.rabbitAction === 'delete') {
                    userCache.delete(cacheKey);
                    console.log(`Deleted user from cache: ${cacheKey}`);
                } else if (userData.rabbitAction === 'create' || userData.rabbitAction === 'update') {
                    userCache.set(cacheKey, userData);
                    console.log(`User RabbitMQ Service | ${userData.rabbitAction} | user: ${cacheKey}`);
                }
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('RabbitMQ setup User error:', error);
        throw error;
    }
}

async function setupTerritoryRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'territory_updates';

        await channel.assertQueue(queue, { durable: true });
        console.log('Territory Service connected to RabbitMQ');

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const territoryData = JSON.parse(msg.content.toString());
                const cacheKey = `territory:${territoryData._id}`;
                if (territoryData.rabbitAction === 'delete') {
                    territoryCache.delete(cacheKey);
                    console.log(`Deleted user from cache: ${cacheKey}`);
                } else if (territoryData.rabbitAction === 'create' || territoryData.rabbitAction === 'update') {
                    territoryCache.set(cacheKey, territoryData);
                    console.log(`Territory Service | ${territoryData.rabbitAction} | territory: ${cacheKey}`);
                }
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('RabbitMQ setup error:', error);
        throw error;
    }
}

module.exports = { setupUsersRabbitMQ, setupTerritoryRabbitMQ };
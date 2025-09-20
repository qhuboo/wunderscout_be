import amqp from "amqplib";
import config from "./config.js";

export async function sendMessage(queue: string, message: string) {
  console.log("BE: Connecting to RabbitMQ...");
  try {
    // Connect
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();

    // Assert channel exists
    await channel.assertQueue(queue, { durable: true });
    console.log("BE: Connected to RabbitMQ.");

    // Send the message
    const ok = channel.sendToQueue(queue, Buffer.from(message));

    // Close the connection
    setTimeout(function () {
      connection.close();
    }, 500);

    return ok;
  } catch (error) {
    console.log("Error sending message: ", error);
  }
}




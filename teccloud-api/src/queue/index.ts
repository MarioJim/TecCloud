import { connect, Channel as RMQChannel } from 'amqplib';
import { rabbitmq } from '../config';
import { File } from '../db';

const getRabbitMQChannel = async (): Promise<Channel> => {
  if (!rabbitmq.available) {
    return new LoggingChannel();
  }
  const conn = await connect({
    hostname: rabbitmq.host,
    username: rabbitmq.user,
    password: rabbitmq.password,
  });
  const channel = await conn.createChannel();
  if (!rabbitmq.textQueue || !rabbitmq.thumbnailsQueue) {
    throw new Error('RMQ_TEXT_QUEUE or RMQ_THUMB_QUEUE not defined');
  }
  await channel.assertQueue(rabbitmq.textQueue);
  await channel.assertQueue(rabbitmq.thumbnailsQueue);
  return new RabbitMQChannel(
    channel,
    rabbitmq.textQueue,
    rabbitmq.thumbnailsQueue,
  );
};

interface Channel {
  queueFile(file: File): void;
}

class LoggingChannel implements Channel {
  queueFile(file: File): void {
    console.log(
      `Skipping extracting text and generating thumbnails for file ${file.fileName}`,
    );
  }
}

class RabbitMQChannel implements Channel {
  innerChannel: RMQChannel;
  textQueue: string;
  thumbnailsQueue: string;

  constructor(
    innerChannel: RMQChannel,
    textQueue: string,
    thumbnailsQueue: string,
  ) {
    this.innerChannel = innerChannel;
    this.textQueue = textQueue;
    this.thumbnailsQueue = thumbnailsQueue;
  }

  queueFile(file: File): void {
    const fileJson = JSON.stringify(file);
    const fileBuf = Buffer.from(fileJson);
    this.innerChannel.sendToQueue(this.textQueue, fileBuf);
    this.innerChannel.sendToQueue(this.thumbnailsQueue, fileBuf);
  }
}

export const channel = getRabbitMQChannel();

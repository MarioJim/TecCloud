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
  if (!rabbitmq.queue) {
    throw new Error('RABBITMQ_WORKER_QUEUE not defined');
  }
  await channel.assertQueue(rabbitmq.queue);
  return new RabbitMQChannel(channel, rabbitmq.queue);
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
  queue: string;

  constructor(innerChannel: RMQChannel, queue: string) {
    this.innerChannel = innerChannel;
    this.queue = queue;
  }

  queueFile(file: File): void {
    const fileJson = JSON.stringify(file);
    const fileBuf = Buffer.from(fileJson);
    this.innerChannel.sendToQueue(this.queue, fileBuf);
  }
}

export const channel = getRabbitMQChannel();

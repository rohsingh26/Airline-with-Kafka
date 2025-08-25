import { Kafka } from 'kafkajs';

const brokers = process.env.KAFKA_BROKERS?.split(',') || [];
console.log("🔗 Kafka brokers loaded from .env:", brokers);

export const kafka = new Kafka({
  clientId: 'airport-tracker',
  brokers,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'airport-tracker-group' });

export async function connectKafka() {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected');

    await consumer.connect();
    console.log('✅ Kafka consumer connected');
  } catch (err) {
    console.error('❌ Kafka connection failed:', err);
  }
}

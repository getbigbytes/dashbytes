import { EncryptionUtil } from './EncryptionUtil';

test('Message is unchanged by encryption and decryption', () => {
    const service = new EncryptionUtil({
        clairdashConfig: { clairdashSecret: 'secret' },
    });
    const message = 'extremely secret';
    expect(service.decrypt(service.encrypt(message))).toStrictEqual(message);
});

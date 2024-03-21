import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../user/entities/user.entity';


// Define el esquema de Mongoose para Word
export const WordSchema: Schema = new Schema({
    word: { type: String, required: true, unique: true},
    translation: { type: String, required: false },
    img: { type: String, required: false , default: 'pendiente' },
    audio: { type: String, required: false , default: 'pendiente' },
    level: { type: String, required: false, default: 'pendiente'  },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    phrases: [{ type: String, required: false, default: [] }],
    status: { type: String, required: false, default: 'pendiente' },
});


export interface Word extends Document {
    word: string;
    translation: string;
    img: string;
    audio: string;
    level: string;
    user: User;
}

// Define el esquema de Mongoose para Word
export const WordModel = mongoose.model<Word>('Word', WordSchema);


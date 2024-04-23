/* eslint-disable prettier/prettier */

import mongoose, { Schema, Document } from 'mongoose';
import { Story } from '../../story/entities/story.entity';
import { User } from '../../user/entities/user.entity';



export interface Phrase extends Document{
    phrase: string;
    translation: string;
    img: string;
    audio: string;
    level: string;
    categories: string[];
    user: User;
    date: string;
    originStory: Story
}


export const PhraseSchema: Schema = new Schema({
    phrase: { type: String, required: true, unique: true},
    translation: { type: String, required: true },
    img: { type: String, required: false },
    audio: { type: String, required: false, default:  'pendiente' },
    level: { type: String, required: false },
    categories: { type: [String], required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, default: Date.now()},
    originStory: { type: Schema.Types.ObjectId, ref: 'Story', required: false }
},
    {
        versionKey: false,
    }
);

PhraseSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});


const PhraseModel = mongoose.model<Phrase>('Phrase', PhraseSchema);

export default PhraseModel;

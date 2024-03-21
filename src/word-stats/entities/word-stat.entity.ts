/* eslint-disable prettier/prettier */
import { Schema, model, Document } from 'mongoose';
import { Word } from '../../word/entities/word.entity';
import { User } from '../../user/entities/user.entity';


export interface WordStat extends Document {

    user: User;
    word: Word;
    reproductions: number;
    reproductionsCompletes: number;
    isFavorite: boolean;
    isOwner: boolean;
    listenDate: Date;
    playList: [string];
    categories: [string];

}


export const WordStatSchema = new Schema<WordStat>({
    word: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reproductions: { type: Number, default: 0 },
    reproductionsCompletes: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
    listenDate: { type: Date, default: Date.now },
    playList: [{ type: String, required: false, default: [] }],
    categories: [{ type: String, required: false, default: [] }],
},
{
    versionKey: false,
}

);


WordStatSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});

export const WordStatModel = model<WordStat>('WordStat', WordStatSchema);
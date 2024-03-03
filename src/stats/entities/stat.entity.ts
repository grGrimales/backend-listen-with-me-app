import { Schema, model, Document } from 'mongoose';
import { Story } from '../../story/entities/story.entity';
import { User } from '../../user/entities/user.entity';
export class Stat {}

export interface Stat extends Document {
    story:  Story;
    user:  User;
    reproductions: number;
    reproductionsCompletes: number;
    isFavorite: boolean;
    isOwner: boolean;
    listenDate: Date;
}

export const StatSchema = new Schema<Stat>({
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reproductions: { type: Number, default: 0 },
    reproductionsCompletes: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
    listenDate: { type: Date, default: Date.now },
},
{
    versionKey: false,
}

);

StatSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});


export const StatModel = model<Stat>('Stat', StatSchema);

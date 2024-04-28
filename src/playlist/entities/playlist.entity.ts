/* eslint-disable prettier/prettier */
import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Story } from '../../story/entities/story.entity';
import { Word } from '../../word/entities/word.entity'
import { Phrase } from '../../phrase/entities/phrase.entity';
import { WordStat } from '../../word-stats/entities/word-stat.entity';

export interface PlayList extends Document {
    title: string;
    type: string;
    user: User;
    editorUsers: User[];
    viewerUsers: User[];
    stories: Story[];
    words: Word[];
    phrases: Phrase[];

}



export const PlayListSchema : Schema = new Schema({

    title: { type: String, required: true },
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    editorUsers: { type: [Schema.Types.ObjectId], ref: 'User', required: false },
    viewerUsers: { type: [Schema.Types.ObjectId], ref: 'User', required: false },
    stories: { type: [Schema.Types.ObjectId], ref: 'Story', required: false },
    words: { type: [Schema.Types.ObjectId], ref: 'Word', required: false },
    phrases: { type: [Schema.Types.ObjectId], ref: 'Phrase', required: false },
    // TODO: Pendiente agregar frases
});


const PlayListModel = mongoose.model('PlayList', PlayListSchema);

export default PlayListModel;
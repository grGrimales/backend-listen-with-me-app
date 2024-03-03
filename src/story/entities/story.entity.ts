import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../user/entities/user.entity';


// Define el esquema de Mongoose para Paragraph
export const ParagraphSchema: Schema = new Schema({
    id_paragraph: { type: String, required: true },
    text: { type: String, required: true },
    translation: { type: String, required: true },
    img: { type: String, required: false },
    audio: { type: String, required: false },
});

export interface Story extends Document {
    title: string;
    img: string;
    date: string;
    categories: string[];
    user: User;
    paragraph: typeof ParagraphSchema[];
    level: { type: String, required: true }

}

// Define el esquema de Mongoose para Story, usando el esquema Paragraph
export const StorySchema: Schema = new Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    img: { type: String, required: false },
    categories: { type: [String], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paragraph: { type: [ParagraphSchema], required: true }, // Usando ParagraphSchema
},

{
    versionKey: false,
}
);

StorySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});



const StoryModel = mongoose.model<Story>('Story', StorySchema);

export default StoryModel;

'use strict'

const { Types } = require("mongoose")
const keytokenModel = require("../models/keytoken.model")

class KeyTokenService{
    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {
            // const publicKeyString = publicKey.toString()
            // level 0
            // const tokens = await keytokenModel.create({user: userId, publicKey: publicKey, privateKey: privateKey})

            const filter = {user: userId}
            const update = {publicKey, privateKey, refreshTokensUsed: [], refreshToken}
            const options = {upsert: true, new: true}

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        console.log("userId:: ", userId)
        // return await keytokenModel.findOne({user: new Types.ObjectId(userId) }).lean()
        return await keytokenModel.findOne({user: userId }).lean()
    }

    static removeKeyById = async (id ) => {
        return await keytokenModel.deleteOne({ _id: id });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({refreshTokensUsed: refreshToken}).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({refreshToken}).lean()
    }


    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({user: userId})
    }

    static async updateToken(id, updateData) {
        return keytokenModel.findByIdAndUpdate(id, {
            $set: {
                refreshToken: updateData.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: updateData.refreshTokensUsed
            }
        }, { new: true });
//         { new: true }: Ensures that the method returns the updated document.
// Without { new: true }, the method would return the document as it was before the update.
    }

}

module.exports = KeyTokenService
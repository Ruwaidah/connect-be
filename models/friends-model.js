import db from "../database/dbConfig.js";

const getAllFriendsList = async (data) => {
  const friends1 = await db("friends")
    .where({ user_id: data.id })
    .join("users", "friends.friend_id", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friends.id",
      "friends.friend_id as friendId",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );
  const friends2 = await db("friends")
    .where({ friend_id: data.id })
    .join("users", "friends.user_id", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friends.id",
      "friends.user_id as friendId",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  return [...friends1, ...friends2];
};

const findFriend = (data) => db("users").where(data);

// ************************** IS FRIEND  ******************************
const isFriend = (data) => {
  return db("friends")
    .where({ user_id: data.userid, friend_id: data.friendId })
    .orWhere({ user_id: data.friendId, friend_id: data.userid })
    .first();
};

// ************************** DELETE FRIEND  ******************************
const deleteFriend = async (data) => {
  const user = await db("friends")
    .where({ user_id: data.user_id, friend_id: data.friend_id })
    .orWhere({ user_id: data.friend_id, friend_id: data.user_id })
    .del();
  return getAllFriendsList({ id: data.user_id });
};

// ********************************** SEARCH USER BY USERNAME **********************************
const searchUserByUsername = async ({
  username,
  userid,
}) => {
  return db("users")
    .leftJoin(
      "images",
      "users.image_id",
      "images.id"
    )

    .whereNot(
      "users.id",
      Number(userid)
    )

    .andWhere((query) => {
      query
        .whereILike(
          "users.username",
          `%${username}%`
        )
        .orWhereILike(
          "users.firstName",
          `%${username}%`
        )
        .orWhereILike(
          "users.lastName",
          `%${username}%`
        );
    })

    .whereNotExists(function () {
      this.select(1)
        .from("blocked_users as b")
        .where(function () {
          this.where(function () {
            this.whereRaw(
              `b."blockerId" = ?`,
              [Number(userid)]
            ).andWhereRaw(
              `b."blockedId" = "users"."id"`
            );
          })
            .orWhere(function () {
              this.whereRaw(
                `b."blockedId" = ?`,
                [Number(userid)]
              ).andWhereRaw(
                `b."blockerId" = "users"."id"`
              );
            });
        });
    })

    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    ).first()
};




// ********************************** GET BLOCKED USERS LIST **********************************
const getBlockedUsers = async (blockerId) => {
  return db("blocked_users as b")
    .join(
      "users as u",
      "b.blockedId",
      "u.id"
    )
    .leftJoin(
      "images as img",
      "u.image_id",
      "img.id"
    )
    .where(
      "b.blockerId",
      Number(blockerId)
    )
    .select(
      "b.id as blockId",
      "u.id",
      "u.firstName",
      "u.lastName",
      "u.username",
      "u.bio",
      "u.image_id",
      "img.image",
      "img.public_id"
    )
    .orderBy(
      "b.created_at",
      "desc"
    );
};


// ********************************** UNBLOCK USER **********************************
const unblockUser = async ({
  blockerId,
  blockedId,
}) => {
  return db("blocked_users")
    .where({
      blockerId: Number(blockerId),
      blockedId: Number(blockedId),
    })
    .del();
};


export default {
  getAllFriendsList,
  findFriend,
  deleteFriend,
  isFriend,
  searchUserByUsername,
  getBlockedUsers,
  unblockUser
};

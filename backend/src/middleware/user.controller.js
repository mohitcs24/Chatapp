import FriendRequest from "../models/FriendRequest";
import FriendRequest from "../models/FriendRequest";
import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

export async function getRecommendedUsers(req, res) {
    try{
        const currentUserId = req.user.id;
        const currentUser = req.user
        
        const recommendedUsers =  await User.find({
            $and: [
                {_id: {$ne: currentUserId}}, //ye cuurent user ko exclude karega
                {$id: {$nin: currentUser.friends}},// exclude current user's friends
                {isOnboarded: true },
            ],
        });
        res.status(200).json(recommendedUsers);

    }  catch(error){
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({message: "Internal server Error"});
    }
}

export async function getMyFriends(req, res) {
    try{
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilepic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    }catch(error){
     
     console.error("Error in getMyFriends controller", error.message);
     res.status(500).json({ message: "Internal server Error"});   
    }
}

export async function sendFriendRequest(req, res){
    try{
     const myId = req.user.id;
     const {id:recipientId} =req.params


     // prevent sending  req to yourself
     if(myId===recipientId) {
        return res.status(400).json ({message: "You can't send  friend request to yourself "});
     }

     const recipient =  await User.findById(recipientId)
     if(!recipient)
     {
        return res.status(404).json({message: "Recipient not found"}); 
     }
      // ye check karge ki user is already friends 
     if(recipient.friends.includes(myId)){
        return res.status(404).json({message: "you are already friends with this user"});
     }

     // check if a req already exists

     const existingRequest = await FriendRequest.findOne({
        $or:[
            {sender:myId, recipient:recipientId},
            {sender:recipientId, recipient:myId}
        ],
     });

    if (existingRequest){
        return res
        .status(400)
        .json({message: "A friend  request  already exists between  you and this user"});   
    }

       const FriendRequest = await FriendRequest.create({
        sender: myId,
        recipient: recipientId,
       });
     
       res.status(201).json(FriendRequest);

    }catch (error){
     console.error("Error in sendFriendRequest controller ", error.message);
     res.status(500).json({message: "Internal Server Error"});
    }
}


export async function acceptFriendRequest(req, res){
    try{
     const {id: requestId} = req.params

    const FriendRequest = await FriendRequest.findById(requestId);

    if(!FriendRequest){
        return res.status(404).json({ message: "Friend request not found"});
    }
     
    //verify the current user is the recipient
    if(!FriendRequest.recipient.tostring() !== req.user.id){
        return res.status(404).json({ message: "You are not authorized to accept this request"});
    }
    
    FriendRequest.status = "accepted";
    await FriendRequest.save();

    // add each user to the other's friends array
    await User.findByIdAndUpdate(FriendRequest.sender,{
    $addToset: {friends: FriendRequest.recipient},
    });
    
    await User.findByIdAndUpdate(FriendRequest.recipient,{
    $addToset: {friends: FriendRequest.sender},
    });
     
    res.status(200).json({message: "Friend request accepted"});

    }catch(error){
     console.log("Error in acceptFriendRequest controller", error.message);
     res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
const modifiersList = [
  {
    type: "golden apple",
    affect: "self",
    pickUpReward: 70,
    duration: 3,
    spawnWeight: 9,
  },
  {
    type: "tron",
    affect: "random",
    pickUpReward: 50,
    duration: 10,
    spawnWeight: 10,
  },
  {
    type: "reset borders",
    affect: "map",
    pickUpReward: 30,
    duration: 1, // instant effect
    spawnWeight: 1,
  },
  {
    type: "shorten 10",
    affect: "random",
    pickUpReward: 30,
    duration: 1, // instant effect
    spawnWeight: 2,
  },
  {
    type: "shorten 25",
    affect: "random",
    pickUpReward: 20,
    duration: 1, // instant effect
    spawnWeight: 10,
  },
];

module.exports = modifiersList;

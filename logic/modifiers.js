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
    spawnWeight: 5,
  },
  {
    type: "reset borders",
    pickUpReward: 30,
    spawnWeight: 1,
  },
  {
    type: "shorten 10",
    affect: "random",
    pickUpReward: 30,
    spawnWeight: 2,
  },
  {
    type: "shorten 25",
    affect: "random",
    pickUpReward: 20,
    spawnWeight: 1,
  },
];

module.exports = modifiersList;

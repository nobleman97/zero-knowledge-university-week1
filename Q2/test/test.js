const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        //getting proof and public signals
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        //printing out the stated expression
        console.log('1x2 =',publicSignals[0]);

        //Unstringifying BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //Unstringifying BigInts
        const editedProof = unstringifyBigInts(proof);
        //
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
          //getting proof and public signals
          const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

          //printing out the stated expression
          console.log('1x2x3 =',publicSignals[0]);
  
          //Unstringifying BigInts
          const editedPublicSignals = unstringifyBigInts(publicSignals);
          //Unstringifying BigInts
          const editedProof = unstringifyBigInts(proof);
          //
          const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
      
          const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
      
          const a = [argv[0], argv[1]];
          const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
          const c = [argv[6], argv[7]];
          const Input = argv.slice(8);
  
          expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script 
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");
        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);

        const editedProof = unstringifyBigInts(proof);
        var calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        let argv = calldata.split(',');
        expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x195ce479e620c971b28c46122424c92d37b240741e38668be55863c8221e272d2b9b692007bd1746410f50509bc2fe51677b2c37a4e06487ed359eac1aa433d414bda633c920310ee9a38fbe0d34bc96ec4d6045c970dcf1de93ade55e1248610cc711eeb5cc307660f7ddd9a2eaabbd08873d14b47fe10e78166d31c871183b0106ad8bb4a403473f4f74f09e1824deff43f2d53ee2d3fdcf8227e4298e920224d10d0fccab318243b11dacfa609705b8e3d9891c2e51257919ff40f01e103d2961ce5cb258b11a322e42b490820b114e02417058a64dc6a66920f715640a871cafdb7e9a30ff693e591abf0b4aa8769919c65edee312f652b2f11d94e177440c574170e0d95fd8fe41406dc8b42575b432ce5ae2b58211f7d39589560a26dc13182d2d3fb4fa5337e2b7b8f17c5312ce58f319c526752164eddfd10f3142882a14b5bd4439241ba4d2db8f572ad2f6882094d8405e057fe96148203024848303f9830e3220374676a2c1be821b146e2e738b85f37f4f8894ac91e5908df8a1278b352ccb8e6114466638fbf147fa07d0332d3e8edfcbc3748e37315c655eeb09487d6c5c9995fd2a3b5b5fe171f62cf24d8d9b48ac6091d47dab24465dc65b0ec435b6491e59d0fd5242739f09f3b4e6b3f5ad1fc5e19e12a383829a48430300a64625c5433268669784671ec3c91d37f79301991f2c6edb684c8b54f98e9c29464cda8c3696c02e723abe628f861873b19e8bfc5c806ac78a2bdb5dee28da01817ce30f8c209ccc857d8769ddcf459e24d522a8999d802087adb14a66e330025c77038e4e69471bb559f090226d5307ed49585e0b55e5a1967a8a436a9891099ba7ef415c93cadbac9ea0c67d5f0e7da5e73129bab0cb5a702b22fbb914c80fc07cf7c7c98bdb1ef092ec56987249f7281597f9d798d85027f10784dd41d017a00fb43fddf98e881f12c87cc63c71240e4a32fd3c878a7cafe28cf9dd90fd0449d552251459ded9ffe9c576b370e93117c4029b51407bf3561edd399b8d4011ba3d3fcaf03bb4be7910a75b5a330605e4eae14ff79a14569eff443b4319790d351d80c06eccd2eace18d0d25881b337e7e1c214eb3dd8fea7a6b66b6e12dd';
        let b = ['0x00000000000000000000000000000000000000000000000000000000000000a0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });

});
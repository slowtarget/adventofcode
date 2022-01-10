import run from "aocrunner";

type Passport = {
  byr?: string,
  iyr?: string,
  eyr?: string,
  hgt?: string,
  hcl?: string,
  ecl?: string,
  pid?: string,
  cid?: string
};
const parseInput = (rawInput: string) => {

  return rawInput.replace(/\r\n/g, '\n')
    .split('\n\n')
    .map(p => p.replace(/\n/g, ' ').trim().split(" ").map(v => {
      var [key, value] = v.split(":");
      return { [key]: value };
    })
      .reduce((p, c) => ({ ...p, ...c }), {}))
    .map(p => <Passport>p)

}
const hasAllFields = (passport: Passport): boolean => {
  return !!(passport.byr && passport.iyr && passport.eyr && passport.hgt && passport.hcl && passport.ecl && passport.pid);
}
const isValid = (passport: Passport): boolean => {
  return !!(isValidByr(passport.byr!)
    && isValidIyr(passport.iyr!)
    && isValidEyr(passport.eyr!)
    && isValidHgt(passport.hgt!)
    && isValidHcl(passport.hcl!)
    && isValidEcl(passport.ecl!)
    && isValidPid(passport.pid!));
}
const part1 = (rawInput: string) => {
  return parseInput(rawInput).filter(p => hasAllFields(p)).length;
};

const part2 = (rawInput: string) => {
  return parseInput(rawInput).filter(p => hasAllFields(p)).filter(p => isValid(p)).length;
};

const testInput = `
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in`;
const valid4 = `
pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980
hcl:#623a2f

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022

iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719`;
const invalid = `
eyr:1972 cid:100
hcl:#18171d ecl:amb hgt:170 pid:186cm iyr:2018 byr:1926

iyr:2019
hcl:#602927 eyr:1967 hgt:170cm
ecl:grn pid:012533040 byr:1946

hcl:dab227 iyr:2012
ecl:brn hgt:182cm pid:021572410 eyr:2020 byr:1992 cid:277

hgt:59cm ecl:zzz
eyr:2038 hcl:74454a iyr:2023
pid:3556412378 byr:2007

eyr:2019 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2031 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blb cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1919
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:2003
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2009 pid:896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2021 pid:96056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:0896056539 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:0000000000 hcl:#a97842 hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a000ggg hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#------ hgt:165cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:149cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:194cm

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:58in

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:77in

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165im

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cn

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 2,
      },
      {
        input: valid4,
        expected: 4,
      },
      {
        input: invalid,
        expected: 22,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: valid4,
        expected: 4,
      },
      {
        input: invalid,
        expected: 1,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});

function isValidYear(input: string, from: number, to: number): boolean {
  var yyyy = parseInt(input, 10);
  return !!(yyyy && yyyy >= from && yyyy <= to);
}

function isValidByr(input: string): boolean {
  return isValidYear(input, 1920, 2002);
}


function isValidIyr(input: string): boolean {
  return isValidYear(input, 2010, 2020);
}


function isValidEyr(input: string): boolean {
  return isValidYear(input, 2020, 2030);
}


function isValidHgt(input: string): boolean {
  const result = input.match(/^(\d+)(in|cm)$/);
  if (result) {
    const [, hgt, units] = result;

    if (hgt && units) {
      var h = parseInt(hgt, 10);
      if (units == "cm") {
        return h >= 150 && h <= 193;
      }
      return h >= 59 && h <= 76;
    }
  }
  // console.log(`fail : height ${JSON.stringify(result)}`);
  return false;
}


function isValidHcl(input: string): boolean {
  var result = input.match(/^#[0-9,a-f]{6}$/);
  // console.log(`hair colour ${result}`);
  return result !== null;
}


function isValidEcl(input: string): boolean {
  return ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].some(ecl => ecl === input);
}


function isValidPid(input: string): boolean {
  var result = input.match(/^[0-9]{9}$/);
  // console.log(`pid ${result}`);
  return result !== null;
}
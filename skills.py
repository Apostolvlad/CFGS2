class Skill:
    pass

class Skill0(Skill):
    @classmethod
    def use(cls, one, two):
        damage = one.strPoints * 10
        two.health -= damage
        one.upRage(10)
        return damage

class Skill1(Skill):
    @classmethod
    def use(cls, one, two):
        if not one.downRage(15): return False
        damage = one.strPoints * 20
        two.health -= damage
        return damage

def useSkill(index, one, two): 
    return globals().get("Skill" + str(index)).use(one, two)
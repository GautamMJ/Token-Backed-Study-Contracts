module MyModule::TokenBackedStudy {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Struct representing a study contract.
    struct StudyContract has store, key {
        total_funds: u64,  // Total tokens allocated for studying
    }

    /// Function to create a study contract for a student.
    public fun create_study_contract(student: &signer) {
        let contract = StudyContract {
            total_funds: 0,
        };
        move_to(student, contract);
    }

    /// Function for sponsors to contribute tokens to a study contract.
    public fun contribute_to_study(sponsor: &signer, student: address, amount: u64) acquires StudyContract {
        let contract = borrow_global_mut<StudyContract>(student);
        let contribution = coin::withdraw<AptosCoin>(sponsor, amount);
        coin::deposit<AptosCoin>(student, contribution);
        contract.total_funds = contract.total_funds + amount;
    }
}
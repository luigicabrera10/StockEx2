#![no_std]
#[allow(unused_imports)]
pub use orig_project::*;

#[allow(improper_ctypes)]
mod fake_gsys {
    extern "C" {
        pub fn gr_reply(
            payload: *const u8,
            len: u32,
            value: *const u128,
            err_mid: *mut [u8; 36],
        );
    }
}

#[no_mangle]
extern "C" fn metahash() {
    const METAHASH: [u8; 32] = [7, 3, 230, 11, 177, 210, 36, 252, 80, 69, 75, 144, 254, 145, 198, 24, 115, 134, 107, 162, 254, 75, 219, 215, 141, 149, 197, 26, 86, 60, 105, 105];
    let mut res: [u8; 36] = [0; 36];
    unsafe {
        fake_gsys::gr_reply(
            METAHASH.as_ptr(),
            METAHASH.len() as _,
            u32::MAX as _,
            &mut res as _,
        );
    }
}

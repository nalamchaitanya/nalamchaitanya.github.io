#Buffer OverFlow Attack

##Introduction:

This project is based on the paper [Smashing The Stack For Fun And Profit](http://insecure.org/stf/smashstack.html) by *Aleph One*.

>**What is Buffer Overflow Attack?**

This is a way of altering the program's execution by overflowing an allocated memory for the program. This is mainly caused due to violation of memory safety. There are different types of attacks based on which memory of the process we are going to overflow. For example Stack overflow,Heap Overflow etc.

This project demonstrates how to attack the program by overflowing the stack by passing malicious code into it and overwriting the return address and there by altering the control of the program. All the code and executables are for the 64-bit machine unlike given in the paper. So there may be slight changes which are important to be noticed.

##Requirements:

 You have to be familiar with how a stack functions and some facts about how the function calls are organized using stack (About the frame pointer rbp and the stack pointer rsp). Stacks can be top-down or bottom-up based on the direction of growth of the stack after a push operation. If the rsp value is decreased it means stack is growing downward implies that it is a top-down stack and in the same way if the rsp value is increased then it is growing upward implies that it is a bottom-up stack.

 In this project I used **AT&T** syntax for assembly code which you can get familiarised using [Brennan's Guide to Inline Assembly](http://www.delorie.com/djgpp/doc/brennan/brennan_att_inline_djgpp.html). Basic Inline Assembly is enough as far as this project is concerned.

 We should be adding the gcc option ```-fno-stack-protector``` to prevent any canaries added to the functions and also ```-zexecstack``` whenever you want to give executing permissions to the stack which is generally disabled because of **W xor X** permissions i.e a memory should be marked either executable or writable but not both.

##SourceCode:

 In this project we are mainly  using the fact that the local variables and arrays of a function are allocated in the stack. So by overflowing these buffers (arrays) we can overwrite the return address to which the function goes after completing the function there by taking control over the process.

###[1.c](./1.c),[1.s](./1.s)

In this program we alter the return address from the function 'function' so that the instruction x=1 in the main function is skipped and the old value of the variable x i.e 0 is printed. Refer 1.s file also for further clarification. To disassemble the function use gdb utility [disas /m main](https://sourceware.org/gdb/onlinedocs/gdb/Machine-Code.html). which gives the length of each line in code in bytes.

Next part of the project concentrates basically on what should we overflow the buffer with so that we can get the control. Here we try to execute a bash shell so that we can do anything from that point. So we construct a *shellcode* which will be used to overflow the buffer and then execute so that a shell gets executed and we get a terminal. It is done step by step.

###[spawnshell.c](./spawnshell.c),[spawnshell.s](./spawnshell.s)

This is just an example of how to execute a shell using execve function, a system call. This is written so that we can write our 'shellcode' similar to the assembly code of this file. Execute this and we get a shell.

###[spawnshell_asm.c](./spawnshell_asm.c),[spawnshell_asm.s](./spawnshell_asm.s)

These files are extension of the previous files. In that they directly write the assembly required to perform the system call with the corresponding arguments in the registers as per the [x86_64 syscall instruction convention](https://en.wikibooks.org/wiki/X86_Assembly/Interfacing_with_Linux#int_0x80). **syscall** is an instruction introduced in x86_64 architecture to make system calls faster without accessing interrupt descriptor tables.

You can find the system call number of the execve function either by disassembling execve function at a break point while running or you can also find it in [System call table for x86_64](https://filippo.io/linux-syscall-table/). In this case it is 59 ```0x3b``` for execve function.

###[exitsys.c](./exitsys.c),[exitsys.s](./exitsys.s)

The execve function never returns however it does when it fails, then it keeps on fetching instructions which is not intended and may crash and core dump. To avoid this and to exit cleanly we also have to write the assembly code for the exit system call as we wrote for the execve system call. So let us start with [exitsys.c](./exitsys.c). This just exits cleanly without any error code.

###[exitsys_asm.c](./exitsys_asm.c),[exitsys_asm.s](./exitsys_asm.s)

This file consists the assembly code written for exit system call. We get the system call number for the exit system call from [System call table for x86_64](https://filippo.io/linux-syscall-table/). In this case it is 60 ```0x3c``` for exit function. This program simply exits from the process.

###[string_addr.c](./string_addr.c),[string_addr.s](./string_addr.s)

Now that we have the two system call snippets ready, however if you observe in the file [spawnshell_asm.c](./spawnshell_asm.c) we have kept the filename and also the arguments array as statically declared but now we have to encode them also in the assembly (byte code). To do that first we have to place the filename (in this case "/bin/sh") somewhere in memory and know the address where the string lies.

This file shows how to find the address of the string kept in the code segment, and prints the address. To find the address of the string we put it along with the code itself, at the bottom and find its address by using a series of jump and call instructions by using relative addressing with %rip (the instructions pointer).

###[esp.c](./esp.c),[esp.s](./esp.s)

This program prints the value of stack pointer (%rsp).

###[shellcode.c](./shellcode.c)

Now that we know the address of the string or rather filename we have to prepare the arguments list i.e an array consisting of filename pointer and Null value. So for sake of this we leave 2 quad words(since x86_64 architecture, 64-bits) of gap after the string, below the shellcode. We will construct the array by moving values into this empty space we left (leave empty space by filling any characters) and make it an argument. In the [shellcode.c](./shellcode.c) observe that at the end of the filename spaces are left for this purpose only.

Since we have to copy this shellcode to a buffer to overflow it, it should not contain any NULL bytes i.e a zero byte, whose appearance signifies the end of string and the copying of the string terminates there by not overflowing the buffer and also not copying the entire shellcode. So we tweak the instructions so that NULL byte doesn't appear.

>However this doesn't execute and gives segmentation fault. Guess for a while why this happens?

This happens because our code segment is marked with read only permissions where as we are trying to write the address of the string into the empty space we left, so this gives segmentation fault. So we have to put it in data or stack segment to make it writable however these memory regions are not marked as executable. This is where the rule of W xor X comes to play. However we can give executable permissions to stack by using the flag ```-zexecstack```.

We have written assembly code however we can't copy it into the stack and overflow it, for that we need machine code which we get by disassembling the main function in *shellcode* executable. We will use x/Nx addr to give the N bytes stored from the address addr. We get our assembly code length to be 70 bytes along with the empty space left. We copy the output of gdb into a temporary file, in this case it is [shellcode.txt](./shellcode.txt) which is not corrected for NULL bytes and [corrected_code.txt](./corrected_code.txt)  in which NULL bytes are removed.

From this we need to remove first two columns and spaces, then replace "0x" with "\\x" so that we get a byte code which can be copied to a buffer, which is stored in [shellstring.txt](./shellstring.txt) and correspondingly the [corrected_string.txt](./corrected_string.txt). Since at the time of testing we need to do it multiple number of times, I made a bash script, [shellcode.sh](./shellcode.sh) to do it. You can refer these [1](http://stackoverflow.com/questions/8973450/how-to-select-some-columns-with-awk),[2](http://askubuntu.com/questions/164056/how-do-i-combine-all-lines-in-a-text-file-into-a-single-line),[3](http://askubuntu.com/questions/20414/find-and-replace-text-within-a-file-using-commands),[4](http://osr600doc.sco.com/en/SHL_automate/_Passing_to_shell_script.html) links to make it. And then finally we got the *__shellcode__*.

###[testSC.c](./testSC.c)

Since we now got the shellcode let us test it and see whether it is working as we want. This file tests the ShellCode by executing it. Use ```-zexecstack``` to compile the file so that it executes without giving segmentation fault.

###[overflow.c](./overflow.c)

This file overflows the buffer with the shellcode and executes a shell. Use ```-zexecstack``` and also ```-fno-stack-protector``` flags while compiling the file.
